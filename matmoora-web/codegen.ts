import type { CodegenConfig } from '@graphql-codegen/cli';

/**
 * Typed GraphQL codegen. Reads the live WPGraphQL schema and every
 * `.graphql` operation under lib/wp/queries/, emits typed documents to
 * lib/wp/generated.ts (consumed via `wpClient.request(GetThingDocument, vars)`).
 *
 * Run `pnpm codegen` with WORDPRESS_GRAPHQL_ENDPOINT set. Until at least one
 * query file exists, codegen has nothing to emit — this is expected pre-Phase 1.
 */
const config: CodegenConfig = {
  schema: process.env.WORDPRESS_GRAPHQL_ENDPOINT,
  documents: ['lib/wp/queries/**/*.graphql'],
  ignoreNoDocuments: true,
  generates: {
    'lib/wp/generated.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        skipTypename: false,
        useTypeImports: true,
      },
    },
  },
};

export default config;
