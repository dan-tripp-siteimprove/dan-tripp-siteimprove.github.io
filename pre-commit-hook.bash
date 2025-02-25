#!/usr/bin/env bash

set -uo pipefail
IFS=$'\n\t'  # Inspired by http://redsymbol.net/articles/unofficial-bash-strict-mode/.  Meant as a safety net.  You should still quote variable expansions.
function err_trap_func () {
	exit_status="$?"
  echo "Exiting with status \"$exit_status\" due to command \"$BASH_COMMAND\" (call stack: line(s) $LINENO ${BASH_LINENO[*]} in $0)"
	exit "$exit_status"
}
trap err_trap_func ERR

function exit_trap_func () {
	true
}
trap exit_trap_func EXIT

set -o errtrace

./update-index-html-files.py
git add --all

