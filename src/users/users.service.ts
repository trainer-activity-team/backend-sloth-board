import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { Prisma } from '../generated/prisma/client';
import {
  isForeignKeyConstraintError,
  isPrismaNotFoundError,
  isUniqueConstraintError,
} from '../common/prisma-errors';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  roleId: true,
  role: {
    select: { id: true, name: true },
  },
} satisfies Prisma.UserSelect;

type UserWithRole = Prisma.UserGetPayload<{ select: typeof userSelect }>;

export type { UserWithRole };

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<UserWithRole[]> {
    try {
      return await this.prisma.user.findMany({
        select: userSelect,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users', {
        cause: error,
      });
    }
  }

  async findOne(id: number): Promise<UserWithRole> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: userSelect,
      });

      if (!user) {
        throw new NotFoundException(`User #${id} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user', {
        cause: error,
      });
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserWithRole> {
    await this.findOne(id);

    const data: Prisma.UserUpdateInput = {};

    if (updateUserDto.email !== undefined) {
      data.email = updateUserDto.email.trim();
    }
    if (updateUserDto.firstName !== undefined) {
      data.firstName = updateUserDto.firstName.trim();
    }
    if (updateUserDto.lastName !== undefined) {
      data.lastName = updateUserDto.lastName.trim();
    }
    if (updateUserDto.roleId !== undefined) {
      data.role = { connect: { id: updateUserDto.roleId } };
    }
    if (updateUserDto.password !== undefined) {
      data.password = await argon2.hash(updateUserDto.password);
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: userSelect,
      });
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException(`User #${id} not found`);
      }
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Email already in use');
      }
      if (isForeignKeyConstraintError(error)) {
        throw new BadRequestException('Invalid roleId');
      }
      throw new InternalServerErrorException('Failed to update user', {
        cause: error,
      });
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException(`User #${id} not found`);
      }
      if (isForeignKeyConstraintError(error)) {
        throw new ConflictException(
          'Cannot delete user with related classes or sessions',
        );
      }
      throw new InternalServerErrorException('Failed to delete user', {
        cause: error,
      });
    }
  }
}
