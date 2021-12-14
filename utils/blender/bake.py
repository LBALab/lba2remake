import bpy
import platform
import sys
import argparse
import os
from mathutils import Vector

#############################################################################
###  CONFIGURE BLENDER
#############################################################################
bpy.ops.preferences.addon_install(overwrite=True, filepath="./utils/blender/gltf_lba_addon.py")
bpy.ops.preferences.addon_enable(module="gltf_lba_addon")


#############################################################################
###  PARSE ARGUMENTS
#############################################################################
argv = sys.argv
argv = argv[argv.index("--") + 1:]

parser = argparse.ArgumentParser(description='Perform light baking')
parser.add_argument('--steps', default="import,bake,apply,probes,export")
parser.add_argument('--samples', default=50, type=int)
parser.add_argument('--resolution', default=512, type=int)
parser.add_argument('--margin', default=2, type=int)
parser.add_argument('--denoise', default="FAST", choices=["FAST", "ACCURATE"])
parser.add_argument('--hdri')
parser.add_argument('--input', required=True)
parser.add_argument('--output')

args = parser.parse_args(argv)

output_file = args.output

if output_file is None:
    filename_no_ext = os.path.splitext(args.input)[0]
    output_file = filename_no_ext + "_baked.glb"

steps = args.steps
if steps == "no_probes":
    steps = "import,bake,apply,export"
steps = steps.split(',')

print(flush=True)

print("[INFO]:LIGHT BAKING")
print(f"[INFO]:  STEPS: {steps}")
print(f"[INFO]:  SAMPLES: {args.samples}")
print(f"[INFO]:  RESOLUTION: {args.resolution}")
print(f"[INFO]:  MARGIN: {args.margin}")
print(f"[INFO]:  DENOISE: {args.denoise}")
print(f"[INFO]:  INPUT: {args.input}")
print(f"[INFO]:  OUTPUT: {output_file}", flush=True)


#############################################################################
###  SETUP INITIAL SCENE
#############################################################################
bpy.data.objects.remove(bpy.data.objects["Cube"], do_unlink=True)
bpy.data.objects.remove(bpy.data.objects["Light"], do_unlink=True)

bpy.data.scenes['Scene'].render.engine = 'CYCLES'
bpy.data.scenes['Scene'].use_nodes = True
nodes = bpy.data.scenes['Scene'].node_tree.nodes
nodes.new('CompositorNodeDenoise')
nodes.new('CompositorNodeViewer')
nodes.new('CompositorNodeOutputFile')
nodes.new('CompositorNodeImage')

links = bpy.data.scenes['Scene'].node_tree.links
links.new(nodes["Image"].outputs[0], nodes["Denoise"].inputs[0])
links.new(nodes["Denoise"].outputs[0], nodes["File Output"].inputs[0])
links.new(nodes["Denoise"].outputs[0], nodes["Viewer"].inputs[0])

nodes['Denoise'].prefilter = args.denoise
nodes["Viewer"].use_alpha = False

bpy.context.scene.cycles.samples = args.samples
bpy.context.scene.cycles.device = 'GPU'

if (args.hdri is not None):
    bpy.data.worlds['World'].use_nodes = True
    nodes = bpy.data.worlds['World'].node_tree.nodes
    links = bpy.data.worlds['World'].node_tree.links
    nodes.new('ShaderNodeBackground')
    nodes.new('ShaderNodeTexEnvironment')
    nodes.new('ShaderNodeMapping')
    nodes.new('ShaderNodeTexCoord')
    nodes['Environment Texture'].image = bpy.data.images.load(args.hdri)

    links.new(nodes["Background"].outputs[0], nodes["World Output"].inputs[0])
    links.new(nodes["Environment Texture"].outputs[0], nodes["Background"].inputs[0])
    links.new(nodes["Mapping"].outputs[0], nodes["Environment Texture"].inputs[0])
    links.new(nodes["Texture Coordinate"].outputs[0], nodes["Mapping"].inputs[0])


#############################################################################
###  IMPORT
#############################################################################
print("[PROGRESS]:Importing model", flush=True)
filename = os.path.basename(args.input)
bpy.ops.import_scene.gltf(filepath=args.input, files=[{"name": filename}], loglevel=50)

noise_scale = 6.0
noise_detail = 2.0

# Patch ground texture material for islands
ground_textured = bpy.data.objects.get('ground_textured')
if ground_textured:
    mat = ground_textured.data.materials[0]
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links

    nodes.new(type="ShaderNodeMath")
    nodes.new(type="ShaderNodeMixRGB").name = "MultiplyRGB"
    nodes.new(type="ShaderNodeTexNoise")
    nodes.new(type="ShaderNodeTexCoord")

    nodes["Math"].operation = 'SUBTRACT'
    nodes["Math"].inputs[0].default_value = 1
    nodes['Mix'].blend_type = 'MIX'
    nodes["MultiplyRGB"].blend_type = 'MULTIPLY'
    nodes["MultiplyRGB"].inputs[0].default_value = 1
    nodes['Noise Texture'].noise_dimensions = '3D'
    nodes['Noise Texture'].inputs['Scale'].default_value = noise_scale
    nodes['Noise Texture'].inputs['Detail'].default_value = noise_detail

    links.new(nodes["Mix"].outputs[0], nodes["Principled BSDF"].inputs[0])
    links.new(nodes["Image Texture"].outputs[1], nodes["Math"].inputs[1])
    links.new(nodes["Image Texture"].outputs[0], nodes["Mix"].inputs[1])
    links.new(nodes["Math"].outputs[0], nodes["Mix"].inputs[0])
    links.new(nodes["Vertex Color"].outputs[0], nodes["MultiplyRGB"].inputs[1])
    links.new(nodes["Texture Coordinate"].outputs[3], nodes["Noise Texture"].inputs[0])
    links.new(nodes["Noise Texture"].outputs[0], nodes["MultiplyRGB"].inputs[2])
    links.new(nodes["MultiplyRGB"].outputs[0], nodes["Mix"].inputs[2])

ground_colored = bpy.data.objects.get('ground_colored')
if ground_colored:
    mat = ground_colored.data.materials[0]
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links

    nodes.new(type="ShaderNodeMixRGB")
    nodes.new(type="ShaderNodeTexNoise")
    nodes.new(type="ShaderNodeTexCoord")

    nodes["Mix"].blend_type = 'MULTIPLY'
    nodes["Mix"].inputs[0].default_value = 1
    nodes['Noise Texture'].noise_dimensions = '3D'
    nodes['Noise Texture'].inputs['Scale'].default_value = noise_scale
    nodes['Noise Texture'].inputs['Detail'].default_value = noise_detail

    links.new(nodes["Vertex Color"].outputs[0], nodes["Mix"].inputs[1])
    links.new(nodes["Mix"].outputs[0], nodes["Principled BSDF"].inputs[0])
    links.new(nodes["Texture Coordinate"].outputs[3], nodes["Noise Texture"].inputs[0])
    links.new(nodes["Noise Texture"].outputs[0], nodes["Mix"].inputs[2])

texture_size = bpy.data.images['Image_1'].size
textured_objects = [o for o in bpy.data.objects if o.name.startswith('objects_textured')]
for obj in textured_objects:
    mat = obj.data.materials[0]
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links

    nodes.new("ShaderNodeUVMap")
    nodes.new("ShaderNodeUVMap")
    nodes.new("ShaderNodeUVMap")
    nodes.new("ShaderNodeVectorMath")
    nodes.new("ShaderNodeVectorMath")
    nodes.new("ShaderNodeVectorMath")

    nodes['UV Map'].uv_map = 'UVMap'
    nodes['UV Map.001'].uv_map = 'UVMap.003'
    nodes['UV Map.002'].uv_map = 'UVMap.002'
    nodes['Vector Math'].operation = 'MODULO'
    nodes['Vector Math.001'].operation = 'ADD'
    nodes['Vector Math.002'].operation = 'DIVIDE'
    nodes['Vector Math.002'].inputs[1].default_value = Vector((texture_size[0], texture_size[1], 0))

    links.new(nodes["UV Map"].outputs[0], nodes["Vector Math"].inputs[0])
    links.new(nodes["Vector Math"].outputs[0], nodes["Vector Math.001"].inputs[0])
    links.new(nodes["UV Map.001"].outputs[0], nodes["Vector Math"].inputs[1])
    links.new(nodes["Vector Math.001"].outputs[0], nodes["Vector Math.002"].inputs[0])
    links.new(nodes["UV Map.002"].outputs[0], nodes["Vector Math.001"].inputs[1])
    links.new(nodes["Vector Math.002"].outputs[0], nodes["Image Texture"].inputs[0])


# center view
for screen in bpy.data.screens:
    for area in (a for a in screen.areas if a.type == 'VIEW_3D'):
        for region in (r for r in area.regions if r.type == 'WINDOW'):
            override = {'screen': screen, 'area': area, 'region': region}
            bpy.ops.view3d.view_selected(override)
            bpy.ops.view3d.snap_cursor_to_selected(override)

objects_to_bake = [o for o in bpy.data.objects if o.type == 'MESH'
    and 'skip_baking' not in o
    and o.data.uv_layers.get('UVMap.001')]


#############################################################################
###  BAKE
#############################################################################
if "bake" in steps:
    print("[PROGRESS]:Baking", flush=True)
    resolution = args.resolution
    margin = args.margin
    bake_target = bpy.data.images.new(name="BakeTarget", width=resolution, height=resolution, float_buffer=True)
    i = 0.0
    for obj in objects_to_bake:
        print(f"[PROGRESS]:Baking:{i / len(objects_to_bake)}:{obj.name}", flush=True)
        i += 1.0

        mat = obj.data.materials[0]

        bpy.ops.object.select_all(action='DESELECT')

        nodes = mat.node_tree.nodes
        links = mat.node_tree.links

        node_img = nodes.new(type="ShaderNodeTexImage")
        node_img.image = bake_target
        uvs = nodes.new(type="ShaderNodeUVMap")
        uvs.uv_map = 'UVMap.001'

        links.new(uvs.outputs[0], node_img.inputs[0])

        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)

        mat.node_tree.nodes.active = node_img
        obj.data.uv_layers['UVMap.001'].active = True
        obj.data.use_auto_smooth = False

        bpy.ops.object.bake(use_clear=False, margin=margin, type='DIFFUSE', pass_filter={'DIRECT', 'INDIRECT'})


#############################################################################
###  APPLY
#############################################################################
if "apply" in steps:
    print("[PROGRESS]:Denoising", flush=True)
    baked_mat = bpy.data.materials.new(name="LBABakedMaterial")
    baked_mat.use_nodes = True

    nodes = baked_mat.node_tree.nodes
    links = baked_mat.node_tree.links

    scene_nodes = bpy.data.scenes["Scene"].node_tree.nodes
    scene_nodes['Image'].image = bpy.data.images['BakeTarget']
    tmpfilename = '/tmp/lightmap0001.exr'
    print("Saving lightmap: ", tmpfilename)
    scene_nodes['File Output'].base_path = '/tmp'
    scene_nodes['File Output'].file_slots[0].path = 'lightmap'
    scene_nodes['File Output'].format.file_format = 'OPEN_EXR'
    scene_nodes['File Output'].format.color_mode = 'RGB'
    scene_nodes['File Output'].format.color_depth = '32'
    bpy.ops.render.render(animation=False, write_still=False, use_viewport=False, layer="", scene="")
    lightmap = bpy.data.images.load(tmpfilename)
    lightmap.name = 'Lightmap'

    node_img = nodes.new(type="ShaderNodeTexImage")
    node_img.image = bpy.data.images['Lightmap']

    uvs = nodes.new(type="ShaderNodeUVMap")
    uvs.uv_map = 'UVMap.001'
    node_bg = nodes.new(type="ShaderNodeBackground")

    links.new(uvs.outputs[0], node_img.inputs[0])
    links.new(node_img.outputs[0], node_bg.inputs[0])
    links.new(node_bg.outputs[0], nodes['Material Output'].inputs[0])

    nodes.remove(nodes['Principled BSDF'])

    for obj in objects_to_bake:
        mesh = obj.data
        if mesh.materials.get('LBABakedMaterial'):
            mesh.materials['LBABakedMaterial'] = baked_mat
        else:
            mesh.materials.append(baked_mat)


#############################################################################
###  LIGHT PROBES
#############################################################################
if "probes" in steps:
    print("[PROGRESS]:Light Probes", flush=True)
    bpy.context.scene.render.resolution_percentage = 25
    bpy.context.scene.render.filepath = 'light_probe.hdr'
    bpy.context.scene.render.image_settings.file_format = 'HDR'
    bpy.ops.render.render(use_viewport=True, write_still=True)


#############################################################################
###  EXPORT
#############################################################################
if "export" in steps:
    print("[PROGRESS]:Exporting model", flush=True)
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects_to_bake:
        obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=output_file, export_tangents=True, use_selection=True)
