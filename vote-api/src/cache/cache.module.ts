
// Using cache-manager through nestjs own integration.
// This could be changed to redis without a lot of effort.

// The object to store must be compliant with the structures clone algorithm (https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#javascript_types)

// Access:
//  read:               const value = await this.cacheManager.get('key');  // null if key does not exist
//  write:              await this.cacheManager.set('key', 'value');
//  delete from cache:  await this.cacheManager.del('key');
//  clear cache:        await this.cacheManager.reset();




import { CacheModule } from '@nestjs/cache-manager';
import { Module} from '@nestjs/common';


@Module({
  imports: [
    CacheModule.register({
      store: 'memory', // In-memory storage, valid for one instance of the app
      ttl: 0, // expiration time in seconds, 0 means no expiration
    }),
  ],
  exports: [CacheModule], // Exporta el módulo de cache
})
export class GlobalCacheModule {}


/*
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';

@Module({
  imports: [CacheModule.register()],
  controllers: [AppController],
})
export class AppModule {}
*/