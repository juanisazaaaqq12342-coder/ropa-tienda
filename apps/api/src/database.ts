import './config';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
@Injectable()
export class Database extends PrismaClient implements OnModuleDestroy {
  constructor() {
    const rawUrl = process.env.DATABASE_URL || '';
    const isRemote = Boolean(rawUrl && !rawUrl.includes('127.0.0.1') && !rawUrl.includes('localhost'));
    const connectionString = isRemote ? rawUrl.replace(/[?&]sslmode=[^&]+/g, '').replace(/\?$/, '') : rawUrl;
    const pool = new Pool({
      connectionString,
      ssl: isRemote ? { rejectUnauthorized: false } : undefined,
    });
    super({ adapter: new PrismaPg(pool) });
  }
  async onModuleDestroy() { await this.$disconnect(); }
}
