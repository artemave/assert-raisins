let g:vigun_mappings = [
      \ {
      \   'pattern': 'test/.*Test.ts$',
      \   'all': "./bin/ars --loader ts-node/esm #{file}",
      \   'nearest': "./bin/ars --loader ts-node/esm #{file}:#{line}",
      \   'debug-nearest': './bin/ars --loader ts-node/esm --inspect-brk #{file}:#{line}',
      \ },
      \]
