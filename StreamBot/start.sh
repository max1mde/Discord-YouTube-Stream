#!/bin/bash

SCREEN="NextStream"

if [ "$#" -eq 1 ]; then
	if [ "$1" == "inscreen" ]; then
		while true
		do
			npm run build 
			npm run start   
			echo "-----------[ RESTARTER ]-----------"
			echo "Press Strg+C to cancel!"
			echo "Restart in:"
			for i in 3 2 1
			do
				echo "$i..."
				sleep 1
			done
			echo "-----------[ Restarting... ]-----------"
		done
	fi
else
	screen -S $SCREEN bash $0 inscreen
fi