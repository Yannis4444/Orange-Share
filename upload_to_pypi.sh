# uploads orangeshare to the PyPi

rm -r dist
python -m build
python -m twine upload dist/*
