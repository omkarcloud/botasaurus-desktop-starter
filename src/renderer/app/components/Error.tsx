import { ApiEmpty,  } from "./Empty/Empty"
import { Container } from "./Wrappers"

function formatExc(error: any): any {
  return error.stack || error.toString()
}
export default function Error({ error }: any) {
    return <Container>
    <ApiEmpty error={formatExc(error)} />
    </Container>
  }
  