"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import type { Document } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { formatDate } from "@/lib/utils/format";
import { routes } from "@/config/routes";
import { Badge } from "@/components/ui/badge";

export function DocumentCard({ document }: { document: Document }) {
  return (
    <Link href={routes.libraryDetail(document.id)}>
      <Card interactive className="h-full">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary-500/15 text-primary-700">
            <FileText className="h-5 w-5" />
          </div>
          <CardTitle className="line-clamp-2 text-base">{document.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {document.description && (
            <p className="line-clamp-2 text-sm text-[var(--text-secondary)]">
              {document.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={document.status} />
            <Badge variant="outline">{document.category}</Badge>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted">
          {formatDate(document.created_at)}
        </CardFooter>
      </Card>
    </Link>
  );
}
