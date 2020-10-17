REM @echo off

mount E: ".."
E:
mkdir VOX
mkdir VIDEO

imgmount D "LBA.GOG" -t iso
imgmount D "LBA.DOT" -t iso
D:
cd LBA

copy *.HQR E:\
copy VOX\*.VOX E:\VOX\
copy FLA\*.FLA E:\VIDEO\
