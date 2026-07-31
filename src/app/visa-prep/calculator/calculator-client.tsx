"use client";

import React, { useState, useEffect } from 'react';
import { useT } from '@/hooks/use-t';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calculator, DollarSign, Globe, Stethoscope, FileText, Plane } from 'lucide-react';

interface Country {
  id: string;
  name: string;
  nameI18n: any;
  code: string;
  costEstimate: string | null;
}

interface VisaCategory {
  id: string;
  name: string;
  nameI18n: any;
  slug: string;
}

interface CalculatorClientProps {
  countries: Country[];
  categories: VisaCategory[];
  lang: string;
}

export function CalculatorClient({ countries, categories, lang }: CalculatorClientProps) {
  const t = useT();

  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  // Expenses state
  const [baseFee, setBaseFee] = useState<number>(0);
  const [hasBiometrics, setHasBiometrics] = useState<boolean>(true);
  const [biometricsFee, setBiometricsFee] = useState<number>(85);
  const [hasMedical, setHasMedical] = useState<boolean>(false);
  const [medicalFee, setMedicalFee] = useState<number>(150);
  const [hasInsurance, setHasInsurance] = useState<boolean>(false);
  const [insuranceFee, setInsuranceFee] = useState<number>(300);
  const [hasTranslation, setHasTranslation] = useState<boolean>(true);
  const [translationFee, setTranslationFee] = useState<number>(50);
  const [hasFlight, setHasFlight] = useState<boolean>(false);
  const [flightFee, setFlightFee] = useState<number>(1000);
  const [otherFee, setOtherFee] = useState<number>(0);

  // Update base fee when country changes
  useEffect(() => {
    if (selectedCountryId) {
      const country = countries.find(c => c.id === selectedCountryId);
      if (country && country.costEstimate) {
        // Try to parse the costEstimate string (e.g., "$160" -> 160)
        const match = country.costEstimate.match(/\d+/);
        if (match) {
          setBaseFee(parseInt(match[0], 10));
        }
      }
    }
  }, [selectedCountryId, countries]);

  const totalCost = baseFee + 
    (hasBiometrics ? biometricsFee : 0) + 
    (hasMedical ? medicalFee : 0) + 
    (hasInsurance ? insuranceFee : 0) + 
    (hasTranslation ? translationFee : 0) + 
    (hasFlight ? flightFee : 0) + 
    (otherFee || 0);

  const getLocalizedName = (item: { name: string, nameI18n: any }) => {
    if (item.nameI18n && typeof item.nameI18n === 'object' && item.nameI18n[lang]) {
      return item.nameI18n[lang];
    }
    return item.name;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Configuration Column */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              {t('visaPrep.calc.visaType')}
            </CardTitle>
            <CardDescription>{t('visaPrep.calc.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('visaPrep.calc.country')}</Label>
              <Select value={selectedCountryId} onValueChange={setSelectedCountryId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('visaPrep.calc.country')} />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country.id} value={country.id}>
                      {getLocalizedName(country)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('visaPrep.calc.visaType')}</Label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('visaPrep.calc.visaType')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {getLocalizedName(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              {t('visaPrep.calc.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('visaPrep.calc.baseFee')} ($)</Label>
                <Input 
                  type="number" 
                  value={baseFee || ''} 
                  onChange={(e) => setBaseFee(parseInt(e.target.value) || 0)} 
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('visaPrep.calc.other')} ($)</Label>
                <Input 
                  type="number" 
                  value={otherFee || ''} 
                  onChange={(e) => setOtherFee(parseInt(e.target.value) || 0)} 
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {t('visaPrep.calc.biometrics')}
                  </Label>
                </div>
                <div className="flex items-center gap-4">
                  <Input 
                    type="number" 
                    value={biometricsFee} 
                    onChange={(e) => setBiometricsFee(parseInt(e.target.value) || 0)} 
                    className="w-24 text-right"
                    disabled={!hasBiometrics}
                  />
                  <Switch checked={hasBiometrics} onCheckedChange={setHasBiometrics} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    {t('visaPrep.calc.medical')}
                  </Label>
                </div>
                <div className="flex items-center gap-4">
                  <Input 
                    type="number" 
                    value={medicalFee} 
                    onChange={(e) => setMedicalFee(parseInt(e.target.value) || 0)} 
                    className="w-24 text-right"
                    disabled={!hasMedical}
                  />
                  <Switch checked={hasMedical} onCheckedChange={setHasMedical} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    {t('visaPrep.calc.insurance')}
                  </Label>
                </div>
                <div className="flex items-center gap-4">
                  <Input 
                    type="number" 
                    value={insuranceFee} 
                    onChange={(e) => setInsuranceFee(parseInt(e.target.value) || 0)} 
                    className="w-24 text-right"
                    disabled={!hasInsurance}
                  />
                  <Switch checked={hasInsurance} onCheckedChange={setHasInsurance} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {t('visaPrep.calc.translation')}
                  </Label>
                </div>
                <div className="flex items-center gap-4">
                  <Input 
                    type="number" 
                    value={translationFee} 
                    onChange={(e) => setTranslationFee(parseInt(e.target.value) || 0)} 
                    className="w-24 text-right"
                    disabled={!hasTranslation}
                  />
                  <Switch checked={hasTranslation} onCheckedChange={setHasTranslation} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Plane className="h-4 w-4 text-muted-foreground" />
                    {t('visaPrep.calc.flight')}
                  </Label>
                </div>
                <div className="flex items-center gap-4">
                  <Input 
                    type="number" 
                    value={flightFee} 
                    onChange={(e) => setFlightFee(parseInt(e.target.value) || 0)} 
                    className="w-24 text-right"
                    disabled={!hasFlight}
                  />
                  <Switch checked={hasFlight} onCheckedChange={setHasFlight} />
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Column */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24 bg-primary text-primary-foreground shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {t('visaPrep.calc.total')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-8">
              <span className="text-5xl font-extrabold tracking-tighter">
                ${totalCost.toLocaleString()}
              </span>
            </div>
            
            <div className="space-y-3 mt-4 text-sm font-medium opacity-90">
              <div className="flex justify-between border-b border-primary-foreground/20 pb-2">
                <span>{t('visaPrep.calc.baseFee')}</span>
                <span>${baseFee.toLocaleString()}</span>
              </div>
              {hasBiometrics && (
                <div className="flex justify-between border-b border-primary-foreground/20 pb-2">
                  <span>{t('visaPrep.calc.biometrics')}</span>
                  <span>${biometricsFee.toLocaleString()}</span>
                </div>
              )}
              {hasMedical && (
                <div className="flex justify-between border-b border-primary-foreground/20 pb-2">
                  <span>{t('visaPrep.calc.medical')}</span>
                  <span>${medicalFee.toLocaleString()}</span>
                </div>
              )}
              {hasInsurance && (
                <div className="flex justify-between border-b border-primary-foreground/20 pb-2">
                  <span>{t('visaPrep.calc.insurance')}</span>
                  <span>${insuranceFee.toLocaleString()}</span>
                </div>
              )}
              {hasTranslation && (
                <div className="flex justify-between border-b border-primary-foreground/20 pb-2">
                  <span>{t('visaPrep.calc.translation')}</span>
                  <span>${translationFee.toLocaleString()}</span>
                </div>
              )}
              {hasFlight && (
                <div className="flex justify-between border-b border-primary-foreground/20 pb-2">
                  <span>{t('visaPrep.calc.flight')}</span>
                  <span>${flightFee.toLocaleString()}</span>
                </div>
              )}
              {otherFee > 0 && (
                <div className="flex justify-between border-b border-primary-foreground/20 pb-2">
                  <span>{t('visaPrep.calc.other')}</span>
                  <span>${otherFee.toLocaleString()}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-4 pb-6">
            <p className="text-xs opacity-75 text-center leading-relaxed">
              {t('visaPrep.calc.disclaimer')}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
