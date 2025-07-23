import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<any, T> {
  constructor(private schema: ZodSchema<T>) {}

  transform(value: any): T {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues
          .map((issue) => issue.message)
          .join(', ');
        throw new BadRequestException(`Validation failed: ${errorMessages}`);
      }
      throw new BadRequestException('Invalid input');
    }
  }
}
