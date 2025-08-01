import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';


export default function BillingPage() {
  return (
    <div className="container mx-auto h-[83vh] overflow-hidden flex items-center justify-center bg-background">
      <Card className="w-full h-full   flex flex-col shadow-lg">
        <CardHeader>
          <CardTitle>Billing Overview</CardTitle>
          <CardDescription>Manage your subscription, payment methods, and view your usage.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto min-h-0 flex flex-col gap-8">
          {/* Current Plan */}
          <section>
            <div className="flex items-center gap-4 mb-2">
              <Badge variant="default">Pro</Badge>
              <span className="text-muted-foreground">$20/month</span>
              <Button size="sm" variant="secondary">Manage</Button>
              <span className="text-xs text-muted-foreground ml-auto">Renews on: 2024-08-01</span>
            </div>
          </section>

          {/* Payment Methods */}
          <section>
            <div className="font-semibold mb-2">Payment Methods</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Card</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Visa **** 4242</TableCell>
                  <TableCell>John Doe</TableCell>
                  <TableCell>12/26</TableCell>
                  <TableCell><Badge variant="default">Primary</Badge></TableCell>
                  <TableCell><Button size="sm" variant="outline">Remove</Button></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Mastercard **** 1234</TableCell>
                  <TableCell>John Doe</TableCell>
                  <TableCell>11/25</TableCell>
                  <TableCell><Badge variant="secondary">Backup</Badge></TableCell>
                  <TableCell><Button size="sm" variant="outline">Remove</Button></TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Button className="mt-4" variant="default">Add New Card</Button>
          </section>

          {/* Billing Details */}
          <section>
            <div className="font-semibold mb-2 mt-4">Billing Details</div>
            <div className="mb-2">Payment Method: <span className="font-medium">Visa **** 4242</span></div>
            <div className="mb-2">Billing Email: <span className="font-medium">user@email.com</span></div>
            <div className="mb-2">Address: <span className="font-medium">123 Main St, City, Country</span></div>
            <Button variant="outline" className="mt-2">Update Billing Info</Button>
          </section>

          {/* Invoices */}
          <section>
            <div className="font-semibold mb-2 mt-4">Invoices</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>2024-07-01</TableCell>
                  <TableCell>INV-1001</TableCell>
                  <TableCell><Badge variant="default">Paid</Badge></TableCell>
                  <TableCell>$20</TableCell>
                  <TableCell><Button size="sm" variant="outline">Download</Button></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2024-06-01</TableCell>
                  <TableCell>INV-1000</TableCell>
                  <TableCell><Badge variant="secondary">Paid</Badge></TableCell>
                  <TableCell>$20</TableCell>
                  <TableCell><Button size="sm" variant="outline">Download</Button></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>

          {/* Usage Summary */}
          <section>
            <div className="font-semibold mb-2 mt-4">Usage Summary</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>API Calls</TableCell>
                  <TableCell>8,000</TableCell>
                  <TableCell>10,000</TableCell>
                  <TableCell><Badge variant="default">80%</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Storage</TableCell>
                  <TableCell>2 GB</TableCell>
                  <TableCell>5 GB</TableCell>
                  <TableCell><Badge variant="secondary">40%</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}