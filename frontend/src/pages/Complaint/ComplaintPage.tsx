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
            <Select id="complaint-road" defaultValue="" disabled>
              <option value="" disabled>
                Select a road
              </option>
              <option value="sp-road">Sardar Patel Road</option>
              <option value="gst-road">GST Road</option>
              <option value="omr-lane">OMR Service Lane</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complaint-issue-type" required>
              Issue type
            </Label>
            <Select id="complaint-issue-type" defaultValue="pothole" disabled>
              <option value="pothole">Pothole</option>
              <option value="waterlogging">Waterlogging</option>
              <option value="lighting">Street lighting</option>
              <option value="damage">Road damage</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complaint-severity" required>
              Severity
            </Label>
            <Select id="complaint-severity" defaultValue="medium" disabled>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
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
              defaultValue="Large potholes forming near the junction, causing vehicles to swerve."
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
