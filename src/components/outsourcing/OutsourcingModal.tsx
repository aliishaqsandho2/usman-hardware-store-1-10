import { useState, useEffect } from "react";
import { Search, Package, Clock, Star, MapPin, Phone, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useOutsourcing } from "@/hooks/useOutsourcing";
import { OutsourcedSupplier, OutsourcedProduct } from "@/services/outsourcingService";

interface OutsourcingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  category?: string;
  customerId?: number;
  customerName: string;
  quotationId?: number;
  onOutsourcedOrderCreated?: (order: any) => void;
}

interface ProductQuote {
  supplier: OutsourcedSupplier;
  products: Array<{
    name: string;
    description: string;
    estimatedPrice: number;
    availability: 'in_stock' | 'order_required';
    deliveryDays: number;
  }>;
}

export default function OutsourcingModal({
  open,
  onOpenChange,
  productName,
  category,
  customerId,
  customerName,
  quotationId,
  onOutsourcedOrderCreated
}: OutsourcingModalProps) {
  const { searchExternalProducts, createOutsourcedOrder, loading } = useOutsourcing();
  const [step, setStep] = useState<'search' | 'select' | 'order'>('search');
  const [quotes, setQuotes] = useState<ProductQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<ProductQuote | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState({
    quantity: 1,
    agreedPrice: 0,
    expectedDelivery: '',
    advanceAmount: 0,
    notes: ''
  });

  useEffect(() => {
    if (open && productName) {
      handleSearch();
    }
  }, [open, productName]);

  const handleSearch = async () => {
    setStep('search');
    const results = await searchExternalProducts(productName, category);
    setQuotes(results);
    if (results.length > 0) {
      setStep('select');
    }
  };

  const handleSelectProduct = (quote: ProductQuote, product: any) => {
    setSelectedQuote(quote);
    setSelectedProduct(product);
    setOrderDetails(prev => ({
      ...prev,
      agreedPrice: product.estimatedPrice,
      expectedDelivery: new Date(Date.now() + product.deliveryDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));
    setStep('order');
  };

  const handleCreateOrder = async () => {
    if (!selectedQuote || !selectedProduct) return;

    const outsourcedProduct: OutsourcedProduct = {
      id: `OP-${Date.now()}`,
      name: selectedProduct.name,
      description: selectedProduct.description,
      estimatedPrice: selectedProduct.estimatedPrice,
      supplierId: selectedQuote.supplier.id,
      supplierName: selectedQuote.supplier.name,
      estimatedDelivery: selectedProduct.deliveryDays,
      category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await createOutsourcedOrder({
      quotationId,
      customerId,
      customerName,
      product: outsourcedProduct,
      quantity: orderDetails.quantity,
      agreedPrice: orderDetails.agreedPrice,
      expectedDelivery: orderDetails.expectedDelivery,
      advanceAmount: orderDetails.advanceAmount,
      notes: orderDetails.notes
    });

    if (result.success) {
      onOutsourcedOrderCreated?.(result.order);
      onOpenChange(false);
      // Reset modal state
      setStep('search');
      setQuotes([]);
      setSelectedQuote(null);
      setSelectedProduct(null);
      setOrderDetails({
        quantity: 1,
        agreedPrice: 0,
        expectedDelivery: '',
        advanceAmount: 0,
        notes: ''
      });
    }
  };

  const getReliabilityColor = (reliability: OutsourcedSupplier['reliability']) => {
    switch (reliability) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span>Outsource Product: {productName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {step === 'search' && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Search className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-medium mb-2">Searching External Suppliers</h3>
                <p className="text-sm text-gray-500">Finding the best suppliers for "{productName}"...</p>
              </div>
            </div>
          )}

          {step === 'select' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Available Suppliers ({quotes.length})</h3>
                <Button variant="outline" size="sm" onClick={handleSearch} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  Search Again
                </Button>
              </div>

              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {quotes.map((quote, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{quote.supplier.name}</CardTitle>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{quote.supplier.city}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Phone className="h-4 w-4" />
                                <span>{quote.supplier.phone}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>Avg {quote.supplier.avgDeliveryDays} days</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="flex items-center space-x-1">
                                {renderStars(quote.supplier.rating)}
                                <span className="text-sm font-medium">{quote.supplier.rating}</span>
                              </div>
                              <Badge className={getReliabilityColor(quote.supplier.reliability)}>
                                {quote.supplier.reliability} reliability
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-1">Specialties</p>
                            <div className="flex flex-wrap gap-1">
                              {quote.supplier.specialties.map((specialty, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Available Products</p>
                            {quote.products.map((product, productIndex) => (
                              <div
                                key={productIndex}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex-1">
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-sm text-gray-600">{product.description}</p>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <Badge variant={product.availability === 'in_stock' ? 'default' : 'secondary'}>
                                      {product.availability === 'in_stock' ? 'In Stock' : 'Order Required'}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                      Delivery: {product.deliveryDays} days
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="text-lg font-bold text-green-600">
                                    Rs. {product.estimatedPrice.toLocaleString()}
                                  </p>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSelectProduct(quote, product)}
                                    className="mt-2"
                                  >
                                    Select <ArrowRight className="h-4 w-4 ml-1" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {step === 'order' && selectedQuote && selectedProduct && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('select')}
                >
                  ← Back to Selection
                </Button>
                <h3 className="text-lg font-medium">Create Outsourced Order</h3>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Selected Product & Supplier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Product</Label>
                      <p className="text-sm">{selectedProduct.name}</p>
                      <p className="text-xs text-gray-500">{selectedProduct.description}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Supplier</Label>
                      <p className="text-sm">{selectedQuote.supplier.name}</p>
                      <p className="text-xs text-gray-500">{selectedQuote.supplier.city}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Estimated Price</Label>
                      <p className="text-sm font-bold text-green-600">
                        Rs. {selectedProduct.estimatedPrice.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Availability</Label>
                      <Badge variant={selectedProduct.availability === 'in_stock' ? 'default' : 'secondary'}>
                        {selectedProduct.availability === 'in_stock' ? 'In Stock' : 'Order Required'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Delivery Time</Label>
                      <p className="text-sm">{selectedProduct.deliveryDays} days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={orderDetails.quantity}
                        onChange={(e) => setOrderDetails(prev => ({
                          ...prev,
                          quantity: parseInt(e.target.value) || 1
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="agreedPrice">Agreed Price (per unit) *</Label>
                      <Input
                        id="agreedPrice"
                        type="number"
                        min="0"
                        value={orderDetails.agreedPrice}
                        onChange={(e) => setOrderDetails(prev => ({
                          ...prev,
                          agreedPrice: parseFloat(e.target.value) || 0
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expectedDelivery">Expected Delivery Date *</Label>
                      <Input
                        id="expectedDelivery"
                        type="date"
                        value={orderDetails.expectedDelivery}
                        onChange={(e) => setOrderDetails(prev => ({
                          ...prev,
                          expectedDelivery: e.target.value
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="advanceAmount">Advance Amount (optional)</Label>
                      <Input
                        id="advanceAmount"
                        type="number"
                        min="0"
                        value={orderDetails.advanceAmount}
                        onChange={(e) => setOrderDetails(prev => ({
                          ...prev,
                          advanceAmount: parseFloat(e.target.value) || 0
                        }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special instructions or notes..."
                      value={orderDetails.notes}
                      onChange={(e) => setOrderDetails(prev => ({
                        ...prev,
                        notes: e.target.value
                      }))}
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Order Value:</span>
                      <span className="text-xl font-bold text-blue-600">
                        Rs. {(orderDetails.quantity * orderDetails.agreedPrice).toLocaleString()}
                      </span>
                    </div>
                    {orderDetails.advanceAmount > 0 && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm">Remaining Amount:</span>
                        <span className="text-sm font-medium">
                          Rs. {((orderDetails.quantity * orderDetails.agreedPrice) - orderDetails.advanceAmount).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateOrder}
                  disabled={loading || !orderDetails.quantity || !orderDetails.agreedPrice || !orderDetails.expectedDelivery}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Outsourced Order
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}