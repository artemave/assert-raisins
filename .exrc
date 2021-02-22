let g:vigun_commands = [
      \ {
      \   'pattern': 'test/.*Test.ts$',
      \   'normal': 'node -r ts-node/register',
      \   'current': 'line_number',
      \   'debug': 'node -r ts-node/register --inspect-brk',
      \ },
      \]
