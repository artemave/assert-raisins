let g:vigun_test_keywords = ['it', 'describe']

let g:vigun_mappings = [
      \ {
      \   'pattern': 'test/.*Test.ts$',
      \   'all': "./bin/ars --enable-source-maps --loader ts-node/esm #{file}",
      \   'nearest': "./bin/runner.js --enable-source-maps --loader ts-node/esm #{file}:#{line}",
      \   'debug-nearest': './bin/ars --enable-source-maps --loader ts-node/esm --inspect-brk #{file}:#{line}',
      \ },
      \ {
      \   'pattern': 'test/.*Test.js$',
      \   'all': "./bin/runner.js #{file}",
      \   'nearest': "./bin/runner.js #{file}:#{line}",
      \   'debug-nearest': './bin/ars --inspect-brk #{file}:#{line}',
      \ },
      \ {
      \   'pattern': '.*\.test\.ts$',
      \   'all': "node --test --enable-source-maps --loader ts-node/esm #{file}",
      \   'nearest': 'node --test --enable-source-maps --loader ts-node/esm --test-name-pattern=#{nearest_test} #{file}'
      \ },
      \ {
      \   'pattern': '.*\.test\.js$',
      \   'all': "node --test #{file}",
      \   'nearest': 'node --test --test-name-pattern=#{nearest_test} #{file}'
      \ },
      \]
