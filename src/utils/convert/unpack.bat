@echo off

set data=%1

mount E: "../"
E:
mkdir VOX

imgmount D "LBA2.GOG" -t iso
D:
cd LBA2

copy *.HQR E:\
copy *.OBL E:\
copy *.ILE E:\
copy VOX\*.VOX E:\VOX\
