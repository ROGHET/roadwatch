import { Alert } from '../../components/common/Alert'
import { Button } from '../../components/common/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Label } from '../../components/common/Label'
import { PageContainer } from '../../components/common/PageContainer'
import { SectionHeader } from '../../components/common/SectionHeader'
import { Select } from '../../components/common/Select'
import { Textarea } from '../../components/common/Textarea'
import {
  complaintIssueTypeOptions,
  complaintSeverityOptions,
  mockComplaintDetails,
} from '../../data/complaints'
import { roadSelectOptions } from '../../data/roads'
import { useI18n } from '../../lib/i18n'

const complaintFormSample = mockComplaintDetails[0]

export default function ComplaintPage() {
  const { t } = useI18n()

  return (
    <PageContainer size="narrow" className="gap-6">
      <SectionHeader
        title={t('fileAComplaint')}
        description={t('complaintPageDesc')}
      />

      <Alert variant="info" title={t('demoFormTitle')}>
        {t('demoFormDesc')}
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>{t('complaintDetails')}</CardTitle>
          <CardDescription>
            {t('complaintDetailsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="complaint-road" required>
              {t('road')}
            </Label>
            <Select
              id="complaint-road"
              defaultValue={complaintFormSample.roadId}
              disabled
            >
              <option value="" disabled>
                {t('selectARoad')}
              </option>
              {roadSelectOptions.map((road) => (
                <option key={road.value} value={road.value}>
                  {road.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complaint-issue-type" required>
              {t('issueType')}
            </Label>
            <Select
              id="complaint-issue-type"
              defaultValue={complaintFormSample.issueType}
              disabled
            >
              {complaintIssueTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complaint-severity" required>
              {t('severity')}
            </Label>
            <Select
              id="complaint-severity"
              defaultValue={complaintFormSample.severity}
              disabled
            >
              {complaintSeverityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complaint-description" required>
              {t('description')}
            </Label>
            <Textarea
              id="complaint-description"
              placeholder={t('descriptionPlaceholder')}
              rows={4}
              readOnly
              defaultValue={complaintFormSample.description}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="complaint-latitude">{t('latitude')}</Label>
              <Input
                id="complaint-latitude"
                type="text"
                placeholder="12.9716"
                readOnly
                defaultValue="12.9716"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complaint-longitude">{t('longitude')}</Label>
              <Input
                id="complaint-longitude"
                type="text"
                placeholder="80.2421"
                readOnly
                defaultValue="80.2421"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complaint-photo">{t('photo')}</Label>
            <Input id="complaint-photo" type="file" disabled />
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          <Button type="button" disabled>
            {t('submitComplaint')}
          </Button>
          <Button type="button" variant="outline" disabled>
            {t('saveDraft')}
          </Button>
        </CardFooter>
      </Card>
    </PageContainer>
  )
}
