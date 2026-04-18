import { DicomViewer } from "@/components/dashboard/DicomViewer";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";

const DicomViewerPage = () => {
    return (
        <div className="fixed inset-0 w-full h-[100dvh] z-50 bg-[#050510] overflow-hidden flex flex-col pt-10 sm:pt-0 safe-area-pt">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex-1 flex flex-col overflow-hidden"
            >
                <DicomViewer />
            </motion.div>
        </div>
    );
};

export default DicomViewerPage;
