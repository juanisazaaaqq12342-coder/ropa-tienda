import './config';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
@Injectable()
export class Database extends PrismaClient implements OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const isRemote = Boolean(connectionString && !connectionString.includes('127.0.0.1') && !connectionString.includes('localhost'));
    const pool = new Pool({
      connectionString,
      ssl: isRemote ? { rejectUnauthorized: false } : undefined,
    });
    super({ adapter: new PrismaPg(pool) });
  }
  async onModuleDestroy() { await this.$disconnect(); }
}
