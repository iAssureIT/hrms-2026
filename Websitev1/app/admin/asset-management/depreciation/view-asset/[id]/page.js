"use client";

import ViewAssetDepreciation from "@/widgets/reports/ViewAssetDepreciation";
import { useParams } from "next/navigation";

export default function Page() {
    const params = useParams();
    return <ViewAssetDepreciation assetId={params.id} />;
}
