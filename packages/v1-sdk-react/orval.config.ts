module.exports = {
    'pwn-api-transformer': {
        output: {
            mode: 'tags-split',
            namingConvention: 'kebab-case',
            httpClient: 'fetch',
            client: 'react-query',
            workspace: './src/generated',
            target: './methods',
            schemas: './schemas',
            docs: true,
            // baseUrl: 'https://api.pwn.xyz'
        },
        input: '../../packages/v1-api/src/schema.yaml'
    }
};
