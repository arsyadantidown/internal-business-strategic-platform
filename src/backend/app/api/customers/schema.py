from pydantic import StringConstraints
from typing_extensions import Annotated

CustomerSearch = Annotated[
    str,
    StringConstraints(strip_whitespace=True, max_length=200),
]
