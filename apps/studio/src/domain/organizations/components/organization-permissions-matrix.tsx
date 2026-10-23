"use client";

import { type MatrixCell, PERMISSION_MATRIX_ROWS } from "@loftlancer/actions";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@loftlancer/ui/table";

function cellLabel(cell: MatrixCell): string {
  if (cell === "Y") return "Yes";
  if (cell === "G") return "Access configured";
  return "—";
}

export function OrganizationPermissionsMatrix() {
  return (
    <AccordionSection
      title="Permission matrix"
      description={
        <>
          See what each built-in role can do. <strong>G</strong> means access is
          set through a project assignment or for an individual member.{" "}
          <strong>Admin</strong> is not available in organization settings.
        </>
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Capability</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Member</TableHead>
            <TableHead>Admin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {PERMISSION_MATRIX_ROWS.map((row) => (
            <TableRow key={row.action}>
              <TableCell className="font-medium">{row.label}</TableCell>
              <TableCell>{cellLabel(row.owner)}</TableCell>
              <TableCell>{cellLabel(row.manager)}</TableCell>
              <TableCell>{cellLabel(row.member)}</TableCell>
              <TableCell>{cellLabel(row.admin)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AccordionSection>
  );
}
