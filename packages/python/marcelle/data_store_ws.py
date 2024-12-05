import socketio
from .utils import conform_dict


class DataStoreWS:
    def __init__(
        self,
        location="http://localhost:3030",
    ):
        """DataStores enable communication with Marcelle Backends. DataStores provide
        access to services registered on a backend at the specified location.

        Args:
            location (str, optional): Backend URL. Defaults to "http://localhost:3030".
        """
        super().__init__()
        self.location = location + ("" if location[-1] == "/" else "/")
        self.sio = socketio.Client()

        @self.sio.event
        def connect():
            print(f"Connected to backend at {self.location}")

        @self.sio.event
        def connect_error(data):
            print("The connection failed!", data)

        @self.sio.event
        def disconnect():
            print(f"Disconnected from backend at {self.location}")

    def connect(self, email=None, password=None):
        self.sio.connect(self.location)
        if email is not None and password is not None:
            self.login(email, password)
        return self

    def login(self, email, password):
        res = self.sio.call(
            "create",
            (
                "authentication",
                {
                    "strategy": "local",
                    "email": email,
                    "password": password,
                },
            ),
        )
        if "code" in res:
            print(f"Authentication error [{res['code']}]: {res['message']}")
        else:
            print(f"Authenticated as: {res[1]['user']['email']}")
        return self

    def disconnect(self):
        self.sio.disconnect()

    def service(self, name):
        """Access a service by name

        Args:
            name (str): service name

        Returns:
            Service: Marcelle Service object.
        """
        return ServiceWS(self.location, name, self.sio)


class ServiceWS:
    def __init__(self, location, name, sio):
        """Services provide an interface to interact with data stored in Marcelle
        backend. Since Marcelle backends are based on Feathers.js
        (https://docs.feathersjs.com/), services provide a similar API with
        predefined CRUD methods.

        Args:
            location (str): Backend location URL.
            name (str): service name
            sio (str): Socket-IO client instance
        """
        super().__init__()
        self.location = location
        self.name = name
        self.sio = sio

    def on(self, event_name, callback):
        @self.sio.on(f"{self.name} {event_name}")
        def on_event(data):
            callback(data)

    def find(self, params={}):
        """Retrieves a list of all resources from the service. params.query can be used
        to filter and limit the returned data.

        Args:
            params (dict, optional): contain additional information for the service
            method call. See https://docs.feathersjs.com/api/services.html#params
            Defaults to {}.

        Returns:
            dict: A dictionary containing the response. Data is paginated by default.
            see https://docs.feathersjs.com/api/services.html#params
        """
        query = (
            params["query"]
            if ("query" in params and params["query"] is not None)
            else {}
        )
        res = self.sio.call("find", (self.name, query))
        if "code" in res:
            print(f"An error occurred [{res['code']}]: {res['message']}")
            return {}
        return res[1]

    def get(self, id, params={}):
        """Retrieves a single resource with the given id from the service.

        Args:
            id (str): unique identifier of the ressource
            params (dict, optional): contain additional information for the service
            method call. See https://docs.feathersjs.com/api/services.html#params
            Defaults to {}.

        Returns:
            dict: the requested item as a dictionary
        """
        query = (
            params["query"]
            if ("query" in params and params["query"] is not None)
            else {}
        )
        res = self.sio.call("get", (self.name, id, query))
        if "code" in res:
            print(f"An error occurred [{res['code']}]: {res['message']}")
            return {}
        return res[1]

    def create(self, data, params={}):
        """Creates a new resource with data. The method should return with the newly
        created data. data may also be an array.

        Args:
            data (dict): ressource data as a JSON-serializable dictionary
            params (dict, optional): contain additional information for the service
            method call. See https://docs.feathersjs.com/api/services.html#params
            Defaults to {}.

        Returns:
            dict: the created ressource
        """
        query = (
            params["query"]
            if ("query" in params and params["query"] is not None)
            else {}
        )
        res = self.sio.call("create", (self.name, conform_dict(data), query))
        if "code" in res:
            print(f"An error occurred [{res['code']}]: {res['message']}")
            return {}
        return res[1]

    def update(self, id, data, params={}):
        """Replaces the resource identified by id with data. The method should
        return with the complete, updated resource data. id can also be null
        when updating multiple records, with params.query containing the query
        criteria.

        Args:
            id (str): unique identifier of the ressource
            data (dict): ressource data as a JSON-serializable dictionary
            params (dict, optional): contain additional information for the service
            method call. See https://docs.feathersjs.com/api/services.html#params
            Defaults to {}.

        Returns:
            dict: updated resource data
        """
        query = (
            params["query"]
            if ("query" in params and params["query"] is not None)
            else {}
        )
        res = self.sio.call("update", (self.name, id, conform_dict(data), query))
        if "code" in res:
            print(f"An error occurred [{res['code']}]: {res['message']}")
            return {}
        return res[1]

    def patch(self, id, data, params={}):
        """Merges the existing data of the resource identified by id with the new
        data. id can also be null indicating that multiple resources should be
        patched with params.query containing the query criteria.

        Args:
            id (str): unique identifier of the ressource
            data (dict): partial ressource data as a JSON-serializable dictionary
            params (dict, optional): contain additional information for the service
            method call. See https://docs.feathersjs.com/api/services.html#params
            Defaults to {}.

        Returns:
            dict: updated resource data
        """
        query = (
            params["query"]
            if ("query" in params and params["query"] is not None)
            else {}
        )
        res = self.sio.call("patch", (self.name, id, conform_dict(data), query))
        if "code" in res:
            print(f"An error occurred [{res['code']}]: {res['message']}")
            return {}
        return res[1]

    def remove(self, id, params={}):
        """Removes the resource with id. The method should return with the removed
        data. id can also be null, which indicates the deletion of multiple
        resources, with params.query containing the query criteria.

        Args:
            id (str): unique identifier of the ressource
            params (dict, optional): contain additional information for the service
            method call. See https://docs.feathersjs.com/api/services.html#params
            Defaults to {}.

        Returns:
            dict: the removed data
        """
        query = (
            params["query"]
            if ("query" in params and params["query"] is not None)
            else {}
        )
        res = self.sio.call("remove", (self.name, id, query))
        if "code" in res:
            print(f"An error occurred [{res['code']}]: {res['message']}")
            return {}
        return res[1]

    def items(self, query={}):
        """Returns an iterator over the service data, given an optional query.
        See feathers documentation for querying:
        https://docs.feathersjs.com/api/databases/querying.html

        Args:
            query (dict, optional): Optional query.
            See https://docs.feathersjs.com/api/databases/querying.html.
            Defaults to {}.

        Yields:
            dict: service ressource
        """
        buffer = []
        next_query = query.copy()
        next_query["$limit"] = 10
        while True:
            try:
                if len(buffer) > 0:
                    value = buffer.pop()
                    yield value
                else:
                    found = self.find({"query": next_query})
                    next_query["$skip"] = found["skip"] + found["limit"]
                    buffer = found["data"]
                    if len(buffer) > 0:
                        value = buffer.pop()
                        yield value
                    else:
                        return
            except Exception as e:
                raise type(e)("Error thrown while iterating through a service: " + e)
