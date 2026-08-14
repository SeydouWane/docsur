import { Module } from '@nestjs/common';
import { UtilisateursController } from './utilisateurs.controller';

@Module({
  controllers: [UtilisateursController],
})
export class UtilisateursModule {}
