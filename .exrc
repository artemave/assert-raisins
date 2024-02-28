let g:vigun_mappings = [
      \ {
      \   'pattern': 'test/.*Test.ts$',
      \   'all': './bin/ars -r ts-node/register #{file}',
      \   'nearest': './bin/ars -r ts-node/register #{file}:#{line}',
      \   'debug-nearest': './bin/ars -r ts-node/register --inspect-brk #{file}:#{line}',
      \ },
      \]
