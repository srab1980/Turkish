import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentVersion } from './entities/content-version.entity';
import { VersionHistory } from './entities/version-history.entity';

@Injectable()
export class VersioningService {
  constructor(
    @InjectRepository(ContentVersion)
    private versionRepository: Repository<ContentVersion>,
    @InjectRepository(VersionHistory)
    private historyRepository: Repository<VersionHistory>
  ) {}

  async createVersion(
    contentType: string,
    contentId: string,
    content: any,
    createdBy?: string,
    changeSummary?: string
  ): Promise<ContentVersion> {
    // Get the latest version number
    const latestVersion = await this.versionRepository.findOne({
      where: { contentType, contentId },
      order: { version: 'DESC' }
    });

    const newVersionNumber = latestVersion ? latestVersion.version + 1 : 1;

    // Mark previous version as not current
    if (latestVersion) {
      await this.versionRepository.update(
        { contentType, contentId, isCurrent: true },
        { isCurrent: false }
      );
    }

    // Create new version
    const newVersion = this.versionRepository.create({
      contentType,
      contentId,
      version: newVersionNumber,
      content,
      createdBy,
      changeSummary,
      isCurrent: true,
      isPublished: false
    });

    const savedVersion = await this.versionRepository.save(newVersion);

    // Record history
    await this.recordHistory(savedVersion.id, 'created', createdBy, changeSummary);

    return savedVersion;
  }

  async getCurrentVersion(contentType: string, contentId: string): Promise<ContentVersion> {
    const version = await this.versionRepository.findOne({
      where: { contentType, contentId, isCurrent: true }
    });

    if (!version) {
      throw new NotFoundException(`No current version found for ${contentType}:${contentId}`);
    }

    return version;
  }

  async getPublishedVersion(contentType: string, contentId: string): Promise<ContentVersion> {
    const version = await this.versionRepository.findOne({
      where: { contentType, contentId, isPublished: true },
      order: { version: 'DESC' }
    });

    if (!version) {
      throw new NotFoundException(`No published version found for ${contentType}:${contentId}`);
    }

    return version;
  }

  async getVersionHistory(contentType: string, contentId: string): Promise<ContentVersion[]> {
    return await this.versionRepository.find({
      where: { contentType, contentId },
      order: { version: 'DESC' }
    });
  }

  async getSpecificVersion(
    contentType: string,
    contentId: string,
    version: number
  ): Promise<ContentVersion> {
    const versionEntity = await this.versionRepository.findOne({
      where: { contentType, contentId, version }
    });

    if (!versionEntity) {
      throw new NotFoundException(`Version ${version} not found for ${contentType}:${contentId}`);
    }

    return versionEntity;
  }

  async publishVersion(
    contentType: string,
    contentId: string,
    version: number,
    publishedBy?: string
  ): Promise<ContentVersion> {
    // Unpublish previous versions
    await this.versionRepository.update(
      { contentType, contentId, isPublished: true },
      { isPublished: false }
    );

    // Publish the specified version
    const versionEntity = await this.getSpecificVersion(contentType, contentId, version);
    versionEntity.isPublished = true;
    const publishedVersion = await this.versionRepository.save(versionEntity);

    // Record history
    await this.recordHistory(versionEntity.id, 'published', publishedBy, `Published version ${version}`);

    return publishedVersion;
  }

  async unpublishVersion(
    contentType: string,
    contentId: string,
    version: number,
    unpublishedBy?: string
  ): Promise<ContentVersion> {
    const versionEntity = await this.getSpecificVersion(contentType, contentId, version);
    versionEntity.isPublished = false;
    const unpublishedVersion = await this.versionRepository.save(versionEntity);

    // Record history
    await this.recordHistory(versionEntity.id, 'unpublished', unpublishedBy, `Unpublished version ${version}`);

    return unpublishedVersion;
  }

  async rollbackToVersion(
    contentType: string,
    contentId: string,
    targetVersion: number,
    rolledBackBy?: string
  ): Promise<ContentVersion> {
    const targetVersionEntity = await this.getSpecificVersion(contentType, contentId, targetVersion);

    // Create a new version with the content from the target version
    const newVersion = await this.createVersion(
      contentType,
      contentId,
      targetVersionEntity.content,
      rolledBackBy,
      `Rolled back to version ${targetVersion}`
    );

    // Record history
    await this.recordHistory(
      newVersion.id,
      'rollback',
      rolledBackBy,
      `Rolled back to version ${targetVersion}`
    );

    return newVersion;
  }

  async compareVersions(
    contentType: string,
    contentId: string,
    version1: number,
    version2: number
  ): Promise<{
    version1: ContentVersion;
    version2: ContentVersion;
    differences: any;
  }> {
    const v1 = await this.getSpecificVersion(contentType, contentId, version1);
    const v2 = await this.getSpecificVersion(contentType, contentId, version2);

    // Simple difference calculation (in a real implementation, you might use a more sophisticated diff algorithm)
    const differences = this.calculateDifferences(v1.content, v2.content);

    return {
      version1: v1,
      version2: v2,
      differences
    };
  }

  async deleteVersion(
    contentType: string,
    contentId: string,
    version: number,
    deletedBy?: string
  ): Promise<void> {
    const versionEntity = await this.getSpecificVersion(contentType, contentId, version);

    // Don't allow deletion of current or published versions
    if (versionEntity.isCurrent) {
      throw new Error('Cannot delete the current version');
    }
    if (versionEntity.isPublished) {
      throw new Error('Cannot delete a published version');
    }

    // Record history before deletion
    await this.recordHistory(versionEntity.id, 'deleted', deletedBy, `Deleted version ${version}`);

    await this.versionRepository.remove(versionEntity);
  }

  async getVersionStatistics(contentType: string, contentId: string): Promise<{
    totalVersions: number;
    currentVersion: number;
    publishedVersion: number | null;
    lastModified: Date;
    createdBy: string[];
  }> {
    const versions = await this.getVersionHistory(contentType, contentId);
    const currentVersion = versions.find(v => v.isCurrent);
    const publishedVersion = versions.find(v => v.isPublished);

    const createdBySet = new Set(versions.map(v => v.createdBy).filter(Boolean));

    return {
      totalVersions: versions.length,
      currentVersion: currentVersion?.version || 0,
      publishedVersion: publishedVersion?.version || null,
      lastModified: versions[0]?.updatedAt || new Date(),
      createdBy: Array.from(createdBySet)
    };
  }

  private async recordHistory(
    versionId: string,
    action: string,
    performedBy?: string,
    description?: string,
    changes?: any
  ): Promise<VersionHistory> {
    const history = this.historyRepository.create({
      versionId,
      action,
      performedBy,
      description,
      changes
    });

    return await this.historyRepository.save(history);
  }

  private calculateDifferences(content1: any, content2: any): any {
    // Simple difference calculation
    // In a real implementation, you might use libraries like 'deep-diff' or 'jsondiffpatch'

    const differences = {
      added: [],
      removed: [],
      modified: []
    };

    // Basic object comparison
    if (typeof content1 === 'object' && typeof content2 === 'object') {
      const keys1 = Object.keys(content1 || {});
      const keys2 = Object.keys(content2 || {});

      // Find added keys
      const addedKeys = keys2.filter(key => !keys1.includes(key));
      differences.added = addedKeys.map(key => ({ key, value: content2[key] }));

      // Find removed keys
      const removedKeys = keys1.filter(key => !keys2.includes(key));
      differences.removed = removedKeys.map(key => ({ key, value: content1[key] }));

      // Find modified keys
      const commonKeys = keys1.filter(key => keys2.includes(key));
      differences.modified = commonKeys
        .filter(key => JSON.stringify(content1[key]) !== JSON.stringify(content2[key]))
        .map(key => ({
          key,
          oldValue: content1[key],
          newValue: content2[key]
        }));
    }

    return differences;
  }

  async getContentVersionHistory(contentType: string, contentId: string): Promise<any[]> {
    const versions = await this.getVersionHistory(contentType, contentId);

    return versions.map(version => ({
      version: version.version,
      createdAt: version.createdAt,
      createdBy: version.createdBy,
      changeSummary: version.changeSummary,
      isPublished: version.isPublished,
      isCurrent: version.isCurrent
    }));
  }

  async bulkCreateVersions(versionData: Array<{
    contentType: string;
    contentId: string;
    content: any;
    createdBy?: string;
    changeSummary?: string;
  }>): Promise<ContentVersion[]> {
    const results = [];

    for (const data of versionData) {
      try {
        const version = await this.createVersion(
          data.contentType,
          data.contentId,
          data.content,
          data.createdBy,
          data.changeSummary
        );
        results.push(version);
      } catch (error) {
        console.error(`Failed to create version for ${data.contentType}:${data.contentId}`, error);
      }
    }

    return results;
  }
}
