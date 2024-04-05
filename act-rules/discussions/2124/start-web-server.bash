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

cd "$(dirname "$0")"
#set -o xtrace

nameOfThisProgram="$(basename "$0")"

numArgsMin=0
numArgsMax=0
if [[ ( "$#" -le "$numArgsMin"-1 ) || ( "$#" -ge "$numArgsMax"+1 ) || ( "$#" == 1 && "$1" == "--help" ) ]] ; then
	cat >&2 << EOF
Usage example(s): 
$nameOfThisProgram ARG1 ARG2
EOF
	exit 1
fi

port=9927
echo "Will listen on port $port"
nohup python -m http.server "$port" >/dev/null 2>&1 &

