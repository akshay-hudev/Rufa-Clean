import { Pool } from "pg";

interface LazyPoolOptions {
  connectionString?: () => string | undefined;
  createPool?: (connectionString: string) => Pool;
}

/**
 * Keep configuration and socket creation behind the first database operation.
 * Pure modules may import database-backed modules without loading dotenv,
 * requiring DATABASE_URL, or opening a connection.
 */
export function createLazyPool(options: LazyPoolOptions = {}): Pool {
  const connectionString = options.connectionString ?? (() => process.env.DATABASE_URL);
  const createPool = options.createPool ?? ((value) => new Pool({ connectionString: value }));
  let delegate: Pool | undefined;

  const getDelegate = (): Pool => {
    if (delegate) {
      return delegate;
    }
    const value = connectionString()?.trim();
    if (!value) {
      throw new Error(
        "DATABASE_URL is required when database functionality is invoked",
      );
    }
    delegate = createPool(value);
    return delegate;
  };

  return new Proxy({} as Pool, {
    get(_target, property): unknown {
      // Cleanup is intentionally safe after configuration failure so a
      // composition-root finally block cannot mask the original error.
      if (property === "end") {
        return async (): Promise<void> => {
          if (delegate) {
            await delegate.end();
          }
        };
      }
      const value = Reflect.get(getDelegate(), property);
      return typeof value === "function" ? value.bind(delegate) : value;
    },
    set(_target, property, value): boolean {
      return Reflect.set(getDelegate(), property, value);
    },
  });
}

export const pool = createLazyPool();
