import React, { useState, useEffect } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { COUNTRIES } from '@/constants/countries'

interface PhoneInputProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  error?: boolean
  placeholder?: string
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value = '',
  onChange,
  disabled = false,
  className,
  error = false,
  placeholder = '803 000 0000'
}) => {
  const [open, setOpen] = useState(false)
  const [countryCode, setCountryCode] = useState('+234')
  const [phoneNumber, setPhoneNumber] = useState('')

  // Find current country based on countryCode
  const currentCountry = COUNTRIES.find(c => c.dialCode === countryCode) || COUNTRIES[0]

  // Parse initial value if it's already a full number
  useEffect(() => {
    if (value && value.startsWith('+')) {
      const match = COUNTRIES.find(c => value.startsWith(c.dialCode))
      if (match) {
        setCountryCode(match.dialCode)
        setPhoneNumber(value.slice(match.dialCode.length).trim())
      }
    } else if (value) {
      setPhoneNumber(value)
    }
  }, []) // Run once on mount to handle initial state

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '') // Only numbers
    setPhoneNumber(val)
    onChange(`${countryCode}${val}`)
  }

  const handleCountryChange = (val: string) => {
    setCountryCode(val)
    onChange(`${val}${phoneNumber}`)
    setOpen(false)
  }

  return (
    <div className={cn("flex gap-0 overflow-hidden rounded-xl border border-gray-100 bg-white focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-600 transition-all", error && "border-red-300 ring-4 ring-red-50", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="flex items-center gap-2 px-3 h-auto py-3 border-r border-gray-100 rounded-none hover:bg-gray-50 bg-transparent font-bold text-gray-700"
          >
            <img
              src={`https://flagcdn.com/w40/${currentCountry.code}.png`}
              alt={currentCountry.label}
              className="w-5 h-auto rounded-sm object-cover"
            />
            <span>{countryCode}</span>
            <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {COUNTRIES.map((country) => (
                  <CommandItem
                    key={`${country.code}-${country.dialCode}`}
                    value={`${country.label} ${country.dialCode}`}
                    onSelect={() => handleCountryChange(country.dialCode)}
                    className="flex gap-3 px-3 py-2 cursor-pointer"
                  >
                    <img
                      src={`https://flagcdn.com/w40/${country.code}.png`}
                      alt={country.label}
                      className="w-5 h-auto rounded-sm"
                    />
                    <span className="flex-1 font-medium">{country.label}</span>
                    <span className="text-gray-400 font-mono text-xs">{country.dialCode}</span>
                    {countryCode === country.dialCode && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 border-none focus-visible:ring-0 h-auto py-3 px-4 bg-transparent font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-normal"
      />
    </div>
  )
}
