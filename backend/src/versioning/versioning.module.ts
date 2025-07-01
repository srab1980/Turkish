import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VersioningController } from './versioning.controller';
import { VersioningService } from './versioning.service';
import { ContentVersion } from './entities/content-version.entity';
import { VersionHistory } from './entities/version-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContentVersion,
      VersionHistory
    ])
  ],
  controllers: [VersioningController],
  providers: [VersioningService],
  exports: [VersioningService]
})
export class VersioningModule {}
