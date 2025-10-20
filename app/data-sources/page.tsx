import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'

export default async function DataSourcesPage() {
  const supabase = await createClient()

  const { data: sources } = await supabase
    .from('external_source')
    .select('*')
    .order('name')

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Data Sources & Licenses</h1>
        <p className="text-lg text-muted-foreground">
          Wefrigerator aggregates community fridge and food distribution data
          from multiple public sources. We are committed to transparency and
          proper attribution.
        </p>
      </div>

      <div className="space-y-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Our Data Philosophy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              We believe in the power of open data to build stronger
              communities. Our platform combines:
            </p>
            <ul>
              <li>
                <strong>Community-contributed data:</strong> Direct updates from
                fridge operators and volunteers
              </li>
              <li>
                <strong>Public datasets:</strong> Government and nonprofit food
                distribution locations
              </li>
              <li>
                <strong>Crowdsourced mapping:</strong> Geographic data from
                OpenStreetMap contributors
              </li>
            </ul>
            <p>
              All imported data is reviewed by our admin team before being
              verified and displayed to users. We do not republish full external
              datasets but instead derive minimal location information and link
              back to the original sources.
            </p>
          </CardContent>
        </Card>

        {sources && sources.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">External Data Sources</h2>
            <div className="space-y-4">
              {sources.map((source) => (
                <Card key={source.id}>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {source.name === 'osm_overpass'
                        ? 'OpenStreetMap'
                        : source.name === 'lac_charitable_food'
                          ? 'LA County Department of Public Health'
                          : source.name === 'freedge'
                            ? 'Freedge'
                            : source.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {source.attribution && (
                      <div>
                        <h3 className="font-semibold text-sm mb-1">
                          Attribution
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {source.attribution}
                        </p>
                      </div>
                    )}

                    {source.license && (
                      <div>
                        <h3 className="font-semibold text-sm mb-1">License</h3>
                        <p className="text-sm text-muted-foreground">
                          {source.license}
                        </p>
                      </div>
                    )}

                    {source.attribution_url && (
                      <div>
                        <a
                          href={source.attribution_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          Learn more
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {source.name === 'osm_overpass' && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                          OpenStreetMap® is open data, licensed under the{' '}
                          <a
                            href="https://opendatacommons.org/licenses/odbl/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            Open Data Commons Open Database License
                          </a>{' '}
                          (ODbL) by the{' '}
                          <a
                            href="https://osmfoundation.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            OpenStreetMap Foundation
                          </a>{' '}
                          (OSMF). You are free to copy, distribute, transmit
                          and adapt our data, as long as you credit
                          OpenStreetMap and its contributors.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Contributing Back</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              We encourage our community to contribute improvements back to the
              original data sources:
            </p>
            <ul>
              <li>
                If you find missing or incorrect locations in OpenStreetMap,
                please{' '}
                <a
                  href="https://www.openstreetmap.org/edit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  update the map directly
                </a>
                .
              </li>
              <li>
                For LA County food resources, contact{' '}
                <a
                  href="https://lacounty.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  LA County DPH
                </a>{' '}
                or 211 LA.
              </li>
              <li>
                Community-verified fridges on our platform help everyone locate
                food assistance more easily.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you have questions about our data sources, licensing, or how we
              use external data, please contact us or review our{' '}
              <a href="/privacy" className="underline">
                privacy policy
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

