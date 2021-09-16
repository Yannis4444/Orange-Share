echo "Do you really want to install Orange Share?"
echo "This will run 'pip install orangeshare'"
echo "[y/N]"

read -r a

a=${a,,}

if [ $a == "y" ] || [ $a == "yes" ] || [ $a == "1" ]; then



    if pip install --upgrade orangeshare; then
      echo "-----------------------------------------------"
      echo "Successfully installed Orange Share"
    else
      echo "-----------------------------------------------"
      echo "An error occurred while installing Orange Share"
    fi

    echo "Press ENTER to exit"
    read -r x
fi