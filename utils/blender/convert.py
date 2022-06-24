import bpy
import sys
import argparse
import os
import re

#############################################################################
###  PARSE ARGUMENTS
#############################################################################

argv = sys.argv
argv = argv[argv.index("--") + 1:]

parser = argparse.ArgumentParser(description='Blender character FBX converter', prog='Blender --background --python utils/blender/convert.py --')
parser.add_argument('--file', type=str, required=True, help='GLB file to convert')

args = parser.parse_args(argv)

file = args.file

#############################################################################
###  SETUP INITIAL SCENE
#############################################################################

bpy.data.objects.remove(bpy.data.objects["Cube"], do_unlink=True)
bpy.data.objects.remove(bpy.data.objects["Light"], do_unlink=True)
bpy.data.objects.remove(bpy.data.objects["Camera"], do_unlink=True)

#############################################################################
###  LOAD FILE
#############################################################################

filename = os.path.basename(args.file)
bpy.ops.import_scene.gltf(filepath=args.file, files=[{"name": filename}], loglevel=50, guess_original_bind_pose=False)

#############################################################################
###  RENAME ANIM ACTIONS
#############################################################################

root = [o for o in bpy.data.objects if 'isRoot' in o][0]
name = root.name

for action in bpy.data.actions:
    action.name = re.sub('_' + name + '$', '', action.name)

#############################################################################
###  RENAME ANIM ACTIONS
#############################################################################

output_file = re.sub('\.glb$', '.fbx', args.file)
bpy.ops.export_scene.fbx(filepath=output_file, add_leaf_bones=False, use_custom_props=True)