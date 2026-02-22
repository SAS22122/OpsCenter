import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ email });
    }

    async findById(id: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ id });
    }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.usersRepository.create(userData);
        return this.usersRepository.save(user);
    }

    async updatePreferences(id: string, preferences: any): Promise<User> {
        const user = await this.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        user.preferences = { ...user.preferences, ...preferences };
        return this.usersRepository.save(user);
    }
}

