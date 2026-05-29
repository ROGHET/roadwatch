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

const complaintFormSample = mockComplaintDetails[0]

export default function ComplaintPage() {
  return (
    <PageContainer size="narrow" className="gap-6">
      <SectionHeader
        title="File a Complaint"
        description="Report a road issue with details, location, and severity. Routing will be shown after submission."
      />

      <Alert variant="info" title="Demo form">
        This is a UI skeleton. Form submission and routing are not connected yet.
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Complaint details</CardTitle>
          <CardDescription>
            Provide information to help authorities identify and resolve the issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="complaint-road" required>
              Road
            </Label>
            <Select
              id="complaint-road"
              defaultValue={complaintFormSample.roadId}
              disabled
            >
              <option value="" disabled>
                Select a road
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
              Issue type
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
              Severity
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
              Description
            </Label>
            <Textarea
              id="complaint-description"
              placeholder="Describe the issue, landmarks, and impact on safety..."
              rows={4}
              readOnly
              defaultValue={complaintFormSample.description}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="complaint-latitude">Latitude</Label>
              <Input
                id="complaint-latitude"
                type="text"
                placeholder="12.9716"
                readOnly
                defaultValue="12.9716"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complaint-longitude">Longitude</Label>
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
            <Label htmlFor="complaint-photo">Photo</Label>
            <Input id="complaint-photo" type="file" disabled />
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          <Button type="button" disabled>
            Submit complaint
          </Button>
          <Button type="button" variant="outline" disabled>
            Save draft
          </Button>
        </CardFooter>
      </Card>
    </PageContainer>
  )
}
