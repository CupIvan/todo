#!/usr/bin/php
<?php
function help()
{echo
"Usage: todo [CMD] [-m TEXT] [-t TYPE]
Commands:
  no_command    - write all todo
  bugs          - write all bugs
  link N1 to N2 - link todo (N1) to target (N2)
  --help        - write this help
Keys:
  -m - text of todo
  -t - type of todo: todo (default), done, bug, fix, message
  -a - add todo file
Examples:
  todo -m 'To do someting'
  todo -t done 1
  todo -t bug -m 'Something wrong'
  todo -t fix 1 -m 'something fixed'
  todo -t bug -m 'Something wrong2'
  todo link 3 to 2
";
}

help();

