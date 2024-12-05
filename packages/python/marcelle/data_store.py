from .data_store_ws import DataStoreWS
from .data_store_http import DataStoreHTTP


def DataStore(location="http://localhost:3030", transport="websocket"):
    """A DataStore provides access to services registered on a Marcelle backend
    at the specified location.

    Args:
        location (str, optional): Backend URL. Defaults to "http://localhost:3030".
        transport (str, optional): Transport type, can be "websocket" for real-time
        websocket communication (allowing to react to changes on services), or
        "http".
    """
    if transport == "websocket":
        return DataStoreWS(location)
    if transport == "http":
        return DataStoreHTTP(location)
    raise Exception('Unknown transport %s. Must be "websocket" or "http"' % transport)
