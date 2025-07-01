import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { VersioningService } from './versioning.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('versioning')
@UseGuards(JwtAuthGuard)
export class VersioningController {
  constructor(private readonly versioningService: VersioningService) {}

  @Post('content/:contentType/:contentId/version')
  async createVersion(
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string,
    @Body() versionData: {
      content: any;
      createdBy?: string;
      changeSummary?: string;
    }
  ) {
    return await this.versioningService.createVersion(
      contentType,
      contentId,
      versionData.content,
      versionData.createdBy,
      versionData.changeSummary
    );
  }

  @Get('content/:contentType/:contentId/current')
  async getCurrentVersion(
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string
  ) {
    return await this.versioningService.getCurrentVersion(contentType, contentId);
  }

  @Get('content/:contentType/:contentId/published')
  async getPublishedVersion(
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string
  ) {
    return await this.versioningService.getPublishedVersion(contentType, contentId);
  }

  @Get('content/:contentType/:contentId/history')
  async getVersionHistory(
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string
  ) {
    return await this.versioningService.getVersionHistory(contentType, contentId);
  }

  @Get('content/:contentType/:contentId/version/:version')
  async getSpecificVersion(
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string,
    @Param('version') version: number
  ) {
    return await this.versioningService.getSpecificVersion(contentType, contentId, version);
  }

  @Post('content/:contentType/:contentId/version/:version/publish')
  async publishVersion(
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string,
    @Param('version') version: number,
    @Body() publishData: { publishedBy?: string }
  ) {
    return await this.versioningService.publishVersion(
      contentType,
      contentId,
      version,
      publishData.publishedBy
    );
  }

  @Post('content/:contentType/:contentId/version/:version/unpublish')
  async unpublishVersion(
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string,
    @Param('version') version: number,
    @Body() unpublishData: { unpublishedBy?: string }
  ) {
    return await this.versioningService.unpublishVersion(
      contentType,
      contentId,
      version,
      unpublishData.unpublishedBy
    );
  }

  @Post('content/:contentType/:contentId/rollback/:targetVersion')
  async rollbackToVersion(
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string,
    @Param('targetVersion') targetVersion: number,
    @Body() rollbackData: { rolledBackBy?: string }
  ) {
    return await this.versioningService.rollbackToVersion(
      contentType,
      contentId,
      targetVersion,
      rollbackData.rolledBackBy
    );
  }

  @Get('content/:contentType/:contentId/compare')
  async compareVersions(
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string,
    @Query('version1') version1: number,
    @Query('version2') version2: number
  ) {
    return await this.versioningService.compareVersions(
      contentType,
      contentId,
      version1,
      version2
    );
  }

  @Delete('content/:contentType/:contentId/version/:version')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVersion(
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string,
    @Param('version') version: number,
    @Body() deleteData: { deletedBy?: string }
  ) {
    await this.versioningService.deleteVersion(
      contentType,
      contentId,
      version,
      deleteData.deletedBy
    );
  }

  @Get('content/:contentType/:contentId/statistics')
  async getVersionStatistics(
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string
  ) {
    return await this.versioningService.getVersionStatistics(contentType, contentId);
  }

  @Get('content/:contentType/:contentId/version/:versionId/history')
  async getSpecificVersionHistory(
    @Param('versionId') versionId: string
  ) {
    // This would get the history for a specific version
    // Implementation would depend on your specific needs
    return { message: 'Version history endpoint' };
  }
}
