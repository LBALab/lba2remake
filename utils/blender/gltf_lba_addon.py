import typing
import bpy
import numpy as np
import tempfile

bl_info = {
    "name": "LBA glTF Extension",
    "category": "Generic",
    "blender": (3, 0, 0),
}

def register():
    print('Registering LBA addon')

def unregister():
    print('Unregistering LBA addon')

class glTF2ExportUserExtension:

    def __init__(self):
        from io_scene_gltf2.io.com import gltf2_io
        from io_scene_gltf2.io.com.gltf2_io_extensions import Extension
        from io_scene_gltf2.io.exp import gltf2_io_binary_data
        from io_scene_gltf2.blender.exp.gltf2_blender_image import TmpImageGuard
        from io_scene_gltf2.blender.exp import gltf2_blender_search_node_tree
        self.Extension = Extension
        self.baked_mat_index = -1
        self.gltf2_io = gltf2_io
        self.gltf2_blender_search_node_tree = gltf2_blender_search_node_tree
        self.gltf2_io_binary_data = gltf2_io_binary_data
        self.TmpImageGuard = TmpImageGuard

    def gather_mesh_hook(self, gltf2_mesh, blender_mesh, blender_object, vertex_groups, modifiers, skip_filter, material_names, export_settings):
        baked_mat = blender_mesh.materials.get('LBABakedMaterial')
        gltf2_mat = gltf2_mesh.primitives[0].material
        if baked_mat is not None:
            if self.baked_mat_index == -1:
                image = baked_mat.node_tree.nodes['Image Texture'].image
                self.baked_mat_index =self.gather_image_exr(image)
            gltf2_mat.extensions['LBA2R_lightmaps'] = {}
            gltf2_mat.extensions['LBA2R_lightmaps']['exrImageIndex'] = self.baked_mat_index

        obj_mat = blender_mesh.materials[0]
        if "LBA_Atlas" in obj_mat:
            gltf2_mat.extensions['LBA2R_lba_materials'] = {}
            gltf2_mat.extensions['LBA2R_lba_materials']['useTextureAtlas'] = True
            gltf2_mat.extensions['LBA2R_lba_materials']['atlasMode'] = 'island'
        if "LBA_MixColorAndTexture" in obj_mat:
            gltf2_mat.extensions['LBA2R_lba_materials'] = {}
            gltf2_mat.extensions['LBA2R_lba_materials']['mixColorAndTexture'] = True

    def get_tex_from_socket(self, socket):
        result = self.gltf2_blender_search_node_tree.from_socket(
            socket,
            self.gltf2_blender_search_node_tree.FilterByType(bpy.types.ShaderNodeTexImage))
        if not result:
            return None
        return result[0]

    def gather_image_exr(self, image: bpy.types.Image):
        buffer_view = self.gltf2_io_binary_data.BinaryData(data=self.encode(image))

        image = self.gltf2_io.Image(
            buffer_view=buffer_view,
            extensions=None,
            extras=None,
            mime_type="image/x-exr",
            name="lightmap",
            uri="lightmap.exr"
        )

        return image

    def encode(self, image: bpy.types.Image):
        with self.TmpImageGuard() as guard:
            self.make_temp_image_copy(guard, src_image=image)
            tmp_image = guard.image
            with tempfile.TemporaryDirectory() as tmpdirname:
                tmpfilename = tmpdirname + '/img'
                tmp_image.filepath_raw = tmpfilename
                tmp_image.file_format = 'OPEN_EXR'
                tmp_image.save()
                with open(tmpfilename, "rb") as f:
                    return f.read()

    def make_temp_image_copy(self, guard, src_image: bpy.types.Image):
        """Makes a temporary copy of src_image. Will be cleaned up with guard."""
        guard.image = src_image.copy()
        tmp_image = guard.image

        tmp_image.update()

        if src_image.is_dirty:
            # Unsaved changes aren't copied by .copy(), so do them ourselves
            tmp_buf = np.empty(src_image.size[0] * src_image.size[1] * 4, np.float32)
            src_image.pixels.foreach_get(tmp_buf)
            tmp_image.pixels.foreach_set(tmp_buf)
