"""Build the original reviewer notebook with Blender 5.2 in background mode."""

import math
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def paint(name, hex_color, roughness=.46, metal=0):
    def linear(c):
        c /= 255
        return c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4

    rgb = tuple(linear(int(hex_color[i:i+2], 16)) for i in (0, 2, 4))
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*rgb, 1)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metal
    return material


rose = paint('Light pink cover', 'FEB5C0')
pink_shadow = paint('Rose binding', 'CD708C')
paper = paint('Warm ivory pages', 'FFF5ED')
cream = paint('Porcelain ink', 'FFFDF8', .37)
berry = paint('Pressed rose', 'A4496C', .41)
gold = paint('Satin rose gold', 'CE917C', .33, .48)
lilac = paint('Lilac index', 'BCA5D6')


def block(name, loc, dims, material, radius):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.name, obj.dimensions = name, dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bevel = obj.modifiers.new('Rounded edges', 'BEVEL')
    bevel.width, bevel.segments = radius, 3
    obj.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
    obj.data.materials.append(material)
    return obj


block('Back cover', (0, 0, -.155), (2.34, 3.18, .11), pink_shadow, .051)
block('Page block', (.018, .004, -.009), (2.24, 3.065, .23), paper, .041)
for i in range(1, 4):
    block('Fine edge of paper', (.031, 0, -.12 + i*.054), (2.225, 3.07, .012), cream, .004)
block('Top cover', (0, 0, .163), (2.34, 3.18, .12), rose, .055)
block('Binding strip', (-.998, 0, .219), (.23, 3.04, .045), pink_shadow, .021)

for y, width, material in ((.94, .46, lilac), (.58, .36, cream)):
    block('Topic tab', (1.12, y, .061), (width, .245, .05), material, .024)

bpy.ops.mesh.primitive_torus_add(major_segments=24, minor_segments=8, location=(-1.16, -1.17, .058),
                                 rotation=(math.pi/2, 0, 0), major_radius=.235, minor_radius=.035)
ring = bpy.context.object
ring.name = 'Binder loop 1'
ring.data.materials.append(gold)
for face in ring.data.polygons:
    face.use_smooth = True
for i in range(1, 5):
    copy = ring.copy()
    copy.name = f'Binder loop {i+1}'
    copy.location.y += i*.585
    scene.collection.objects.link(copy)


def ink(name, coords, radius, material):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions, curve.bevel_depth, curve.bevel_resolution = '3D', radius, 3
    curve.use_fill_caps = True
    stroke = curve.splines.new('POLY')
    stroke.points.add(len(coords)-1)
    for point, loc in zip(stroke.points, coords):
        point.co = (*loc, 1)
    obj = bpy.data.objects.new(name, curve)
    scene.collection.objects.link(obj)
    curve.materials.append(material)
    return obj


outline = []
for i in range(65):
    a = i * math.tau / 64
    x = 16 * math.sin(a)**3
    y = 13*math.cos(a) - 5*math.cos(2*a) - 2*math.cos(3*a) - math.cos(4*a)
    outline.append((.095 + x*.039, .22 + y*.044, .241))
ink('Embossed heart', outline, .027, berry)
ink('Raised pulse', [(.095+x, .17+y, .256) for x,y in [(-.48,0),(-.23,0),(-.13,.18),(-.012,-.19),(.095,.105),(.163,0),(.48,0)]], .024, cream)
for y, x2 in ((-.74, .53), (-.94, .36), (-1.14, .18)):
    ink('Note ruling', [(-.54, y, .228), (x2, y, .228)], .014, pink_shadow)

# Convert the ink curves to mesh so both the browser and Blender use the same marks.
for obj in list(scene.objects):
    if obj.type == 'CURVE':
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.convert(target='MESH')
bpy.ops.export_scene.gltf(filepath=str(ROOT/'study-notebook.glb'), export_format='GLB', export_apply=True)


def aim(obj, target=(0, 0, 0)):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()


bpy.ops.object.camera_add(location=(3.55, -4.85, 8.8))
scene.camera = bpy.context.object
aim(scene.camera)
scene.camera.data.type = 'ORTHO'
scene.camera.data.ortho_scale = 3.86


def area(name, loc, power, color, size):
    bpy.ops.object.light_add(type='AREA', location=loc)
    lamp = bpy.context.object
    lamp.name = name
    lamp.data.energy, lamp.data.color, lamp.data.shape, lamp.data.size = power, color, 'DISK', size
    aim(lamp)


area('Softbox', (-3, 1.5, 6), 440, (1, .92, .94), 5)
area('Fill', (3, -3, 4.2), 195, (1, .83, .89), 4)
area('Edge', (1, 4.2, 4), 300, (1, .97, .91), 3)
scene.world = bpy.data.worlds.new('Studio')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = .25
scene.render.engine = 'CYCLES'
scene.cycles.samples = 12
scene.cycles.use_denoising = True
scene.view_settings.view_transform = 'AgX'
scene.render.resolution_x = scene.render.resolution_y = 512
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'WEBP'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.quality = 88
scene.render.filepath = str(ROOT/'study-notebook-poster.webp')
bpy.ops.render.render(write_still=True)
