echo "Orange Share Update"
echo "--------------------------------------------------------------------------------"
echo "Updates will be moved to the python part of the application in the next version."
echo "Next time you will be able to update right from the user interface."
echo "--------------------------------------------------------------------------------"
echo "This will run 'python3 -m pip install --upgrade orangeshare'"
echo "You can find out more about it here: https://github.com/Yannis4444/Orange-Share"
echo "[Y/n]"

read -r a

a=${a,,}

if [ $a == "n" ] || [ $a == "no" ] || [ $a == "0" ]; then
  echo "Bye!"
else
  if python3 -m pip install --upgrade orangeshare; then
    echo "--------------------------------------------------------------------------------"
    echo "Successfully updated Orange Share"
    echo "You need to restart it by clicking the icon twice for the changes to take effect"
  else
    echo "--------------------------------------------------------------------------------"
    echo "An error occurred while updating Orange Share"
  fi

  echo "Press ENTER to exit"
  read -r x
fi
