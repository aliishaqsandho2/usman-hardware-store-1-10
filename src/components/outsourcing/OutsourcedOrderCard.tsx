import { Clock, Package, CheckCircle2, XCircle, Truck, AlertCircle, ExternalLink, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OutsourcedOrder } from "@/services/outsourcingService";

interface OutsourcedOrderCardProps {
  order: OutsourcedOrder;
  onViewDetails: (order: OutsourcedOrder) => void;
  onUpdateStatus: (order: OutsourcedOrder) => void;
}

export default function OutsourcedOrderCard({ 
  order, 
  onViewDetails, 
  onUpdateStatus 
}: OutsourcedOrderCardProps) {
  const getStatusIcon = (status: OutsourcedOrder['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle2 className="h-4 w-4" />;
      case 'ordered': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle2 className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: OutsourcedOrder['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ordered': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: OutsourcedOrder['paymentStatus']) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800';
      case 'advance_paid': return 'bg-yellow-100 text-yellow-800';
      case 'full_paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = () => {
    const expectedDate = new Date(order.expectedDelivery);
    const now = new Date();
    return now > expectedDate && !['delivered', 'cancelled'].includes(order.status);
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${isOverdue() ? 'border-red-200 bg-red-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span>{order.id}</span>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{order.customerName}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(order.status)}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(order.status)}
                <span className="capitalize">{order.status.replace('_', ' ')}</span>
              </div>
            </Badge>
            {isOverdue() && (
              <Badge variant="destructive">
                Overdue
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Product Information */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-sm">{order.product.name}</h4>
          <p className="text-xs text-gray-600 mt-1">{order.product.description}</p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <span className="text-xs text-gray-500">Qty</span>
              <p className="font-medium text-sm">{order.quantity}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Unit Price</span>
              <p className="font-medium text-sm">Rs. {order.agreedPrice.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Total</span>
              <p className="font-medium text-sm text-green-600">Rs. {order.totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Supplier & Timeline */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center space-x-1 mb-1">
              <ExternalLink className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-500">Supplier</span>
            </div>
            <p className="font-medium">{order.product.supplierName}</p>
          </div>
          <div>
            <div className="flex items-center space-x-1 mb-1">
              <Clock className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-500">Expected Delivery</span>
            </div>
            <p className="font-medium">
              {new Date(order.expectedDelivery).toLocaleDateString()}
            </p>
            {order.actualDelivery && (
              <p className="text-xs text-green-600">
                Delivered: {new Date(order.actualDelivery).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Payment Status */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500">Payment Status</span>
            <div className="mt-1">
              <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                {order.paymentStatus.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          {order.advanceAmount && order.advanceAmount > 0 && (
            <div className="text-right">
              <span className="text-xs text-gray-500">Advance Paid</span>
              <p className="text-sm font-medium">Rs. {order.advanceAmount.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Tracking Info */}
        {order.trackingInfo && (
          <div className="bg-blue-50 p-2 rounded text-sm">
            <span className="text-xs text-blue-600 font-medium">Tracking: </span>
            <span className="text-blue-800">{order.trackingInfo}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails(order)}
            className="flex-1"
          >
            View Details
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onUpdateStatus(order)}
            className="flex-1"
          >
            Update Status
          </Button>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <strong>Notes:</strong> {order.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
}