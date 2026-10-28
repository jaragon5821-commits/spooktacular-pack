import org.objectweb.asm.*;
import java.io.*;
import java.nio.file.*;
import java.util.zip.*;

// Replaces List.getFirst() (Java 21 only) with List.get(0) so the printer runs on Java 17.
public class PatchPrinter {
    static final String TARGET = "me/aleksilassila/litematica/printer/guides/placement/GeneralPlacementGuide.class";
    static int replaced = 0;

    public static void main(String[] a) throws Exception {
        try (ZipInputStream in = new ZipInputStream(new FileInputStream(a[0]));
             ZipOutputStream out = new ZipOutputStream(new FileOutputStream(a[1]))) {
            ZipEntry e;
            while ((e = in.getNextEntry()) != null) {
                byte[] data = in.readAllBytes();
                if (e.getName().equals(TARGET)) data = patch(data);
                ZipEntry n = new ZipEntry(e.getName());
                n.setTime(e.getTime());
                out.putNextEntry(n);
                out.write(data);
                out.closeEntry();
            }
        }
        System.out.println("replaced=" + replaced);
        if (replaced != 1) System.exit(1);
    }

    static byte[] patch(byte[] in) {
        ClassReader cr = new ClassReader(in);
        ClassWriter cw = new ClassWriter(cr, ClassWriter.COMPUTE_MAXS);
        cr.accept(new ClassVisitor(Opcodes.ASM9, cw) {
            public MethodVisitor visitMethod(int acc, String name, String desc, String sig, String[] ex) {
                return new MethodVisitor(Opcodes.ASM9, super.visitMethod(acc, name, desc, sig, ex)) {
                    public void visitMethodInsn(int op, String owner, String n, String d, boolean itf) {
                        if (op == Opcodes.INVOKEINTERFACE && owner.equals("java/util/List") && n.equals("getFirst")) {
                            super.visitInsn(Opcodes.ICONST_0);
                            super.visitMethodInsn(op, owner, "get", "(I)Ljava/lang/Object;", true);
                            replaced++;
                        } else super.visitMethodInsn(op, owner, n, d, itf);
                    }
                };
            }
        }, 0);
        return cw.toByteArray();
    }
}
