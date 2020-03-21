@echo off

mount E: ".."
E:
mkdir VOX
mkdir MUSIC
mkdir VIDEO

imgmount D "LBA2.GOG" -t iso
imgmount D "LBA2.DOT" -t iso
D:
cd LBA2

copy *.HQR E:\
copy *.OBL E:\
copy *.ILE E:\
copy VOX\*.VOX E:\VOX\
copy MUSIC\*.wav E:\MUSIC\
copy VIDEO\*.HQR E:\VIDEO\
