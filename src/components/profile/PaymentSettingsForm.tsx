import React from 'react'
import { useFieldArray, Control, UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form'
import { Plus, Trash2, CreditCard, Landmark, Banknote, HelpCircle, ShieldCheck, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

interface PaymentSettingsFormProps {
  control: Control<any>
  register: UseFormRegister<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
  isEditing: boolean
  isCenter?: boolean
}

const PaymentSettingsForm: React.FC<PaymentSettingsFormProps> = ({
  control,
  register,
  watch,
  setValue,
  isEditing,
  isCenter = false
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'paymentSettings.methods'
  })

  const requireUpfront = watch('paymentSettings.requireUpfrontPayment')

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'paystack':
      case 'flutterwave': return <CreditCard className="h-4 w-4 text-indigo-600" />
      case 'binance': return <Coins className="h-4 w-4 text-yellow-500" />
      default: return <HelpCircle className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card className="border-indigo-100 shadow-sm overflow-hidden mt-6">
      <CardHeader className="bg-indigo-50/30 border-b border-indigo-50 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-indigo-900 text-base sm:text-lg">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            Payment Gateway Settings
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <ShieldCheck className="h-4 w-4 text-indigo-500" />
                  <span className="text-[10px] sm:text-xs text-indigo-600 font-medium whitespace-nowrap">Online Gateway Only</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  All payments must be processed via supported online gateways to ensure transparency and automatic fee processing.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Fee Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-indigo-50/20 border border-indigo-100 rounded-xl">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Standard Fees (USD)
            </h4>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700">
                  {isCenter ? 'Facility/Service Fee' : 'Consultation Fee'}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                  <Input
                    type="number"
                    {...register(isCenter ? 'paymentSettings.serviceFee' : 'paymentSettings.consultationFee')}
                    disabled={!isEditing}
                    placeholder="0.00"
                    className="pl-7 bg-white text-xs sm:text-sm h-9"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg">
              <p className="text-[11px] font-bold text-indigo-900 italic">
                "You have to pay for consultation to book services."
              </p>
              <p className="text-[10px] text-indigo-600 mt-1 font-medium flex items-center gap-1">
                <Coins className="h-3 w-3" />
                A 15% platform service charge applies to both parties' wallets upon successful booking.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-end gap-3 translate-y-[-4px]">
            <div className="flex items-center justify-between p-3 bg-white border border-indigo-100 rounded-xl shadow-sm">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold text-gray-900">Require Upfront Payment</Label>
                <p className="text-[10px] text-gray-500 line-clamp-1">Service consultations gated until payment.</p>
              </div>
              <Switch
                checked={requireUpfront}
                onCheckedChange={(checked) => setValue('paymentSettings.requireUpfrontPayment', checked)}
                disabled={!isEditing}
                className="scale-90"
              />
            </div>
          </div>
        </div>


        {/* Payment Methods */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-gray-900">Configured Payment Gateways</h4>
              <p className="text-xs text-gray-500">Provide your subaccount codes or merchant credentials from Paystack, Flutterwave, or Binance.</p>
            </div>
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ type: 'paystack', label: '', details: { subaccount: '' }, instructions: '' })}
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 h-8 px-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Gateway
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {fields.map((field, index) => {
              const type = watch(`paymentSettings.methods.${index}.type`)
              return (
                <div key={field.id} className="relative group p-4 border border-gray-100 rounded-xl bg-gray-50/30 hover:bg-white hover:border-indigo-200 transition-all shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 md:pt-0">
                    <div className="md:col-span-4 space-y-2">
                      <Label className="text-xs font-semibold text-gray-600">Gateway Provider</Label>
                      <Select
                        value={type}
                        onValueChange={(val) => setValue(`paymentSettings.methods.${index}.type`, val)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="bg-white text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            {getMethodIcon(type)}
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paystack">Paystack</SelectItem>
                          <SelectItem value="flutterwave">Flutterwave</SelectItem>
                          <SelectItem value="binance">Binance Pay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-8 space-y-2">
                      <Label className="text-xs font-semibold text-gray-600">Label (Display Name)</Label>
                      <Input
                        {...register(`paymentSettings.methods.${index}.label`)}
                        placeholder={type === 'paystack' ? 'Global Paystack' : type === 'binance' ? 'Binance Wallet' : 'Online Payment'}
                        disabled={!isEditing}
                        className="bg-white text-xs sm:text-sm"
                      />
                    </div>

                    <div className="md:col-span-12 space-y-2 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                      <Label className="text-xs font-semibold text-indigo-700 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        {type === 'paystack' ? 'Paystack Subaccount Code' : type === 'binance' ? 'Binance Merchant ID' : 'Flutterwave Subaccount ID'}
                      </Label>
                      <Input
                        {...register(`paymentSettings.methods.${index}.details.subaccount`)}
                        placeholder={type === 'paystack' ? 'ACCT_xxxxxx' : type === 'binance' ? 'Binance-ID-12345' : '654321'}
                        disabled={!isEditing}
                        className="bg-white text-xs sm:text-sm border-indigo-200 focus:border-indigo-500"
                        required
                      />
                      <p className="text-[10px] text-indigo-500 mt-1">
                        This code is mandatory. Payments made by patients will be split, with you receiving your portion directly via this subaccount.
                      </p>
                    </div>

                    <div className="md:col-span-12 space-y-2">
                      <Label className="text-xs font-semibold text-gray-600">Instructions (Optional)</Label>
                      <Textarea
                        {...register(`paymentSettings.methods.${index}.instructions`)}
                        placeholder="Provide clear steps for the patient to complete payment..."
                        disabled={!isEditing}
                        className="bg-white min-h-[80px] text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none">
                      Active Method #{index + 1}
                    </Badge>
                  </div>
                </div>
              )
            })}

            {fields.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                  <CreditCard className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500 font-medium">No payment methods added yet.</p>
                <p className="text-xs text-gray-400 mt-1">Add methods to start receiving payments for your services.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PaymentSettingsForm
