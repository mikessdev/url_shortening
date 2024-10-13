import { IsNotEmpty, IsString } from 'class-validator';

export class UrlDTO {
  @IsString()
  @IsNotEmpty()
  originalUrl!: string;
}
