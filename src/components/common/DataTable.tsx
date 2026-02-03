import { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
}

export function DataTable<T>({ columns, data, keyExtractor }: DataTableProps<T>) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap ${
                    column.hideOnMobile ? 'hidden md:table-cell' : ''
                  }`}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={keyExtractor(item)} className="hover:bg-secondary/30">
                {columns.map((column) => (
                  <TableCell
                    key={`${keyExtractor(item)}-${column.key}`}
                    className={`py-3 ${column.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                  >
                    {column.render
                      ? column.render(item)
                      : (item as any)[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
