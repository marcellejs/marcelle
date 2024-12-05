import requests
from .utils import conform_dict


class DataStoreHTTP:
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
        self.access_token = None

    def login(self, email, password):
        try:
            url = self.location + "authentication"
            print("url", url)
            res = requests.post(
                url,
                json=conform_dict(
                    {
                        "strategy": "local",
                        "email": email,
                        "password": password,
                    }
                ),
            )
            if res.status_code != 201:
                print(
                    "Error: Could not create authenticate. Improve error message."
                    f"HTTP Status Code: {res.status_code}"
                )
            else:
                self.access_token = res.json()["accessToken"]
        except requests.exceptions.RequestException:
            print("Warning: could not reach Marcelle backend at " + str(self.location))
        finally:
            return self

    def service(self, name):
        """Access a service by name

        Args:
            name (str): service name

        Returns:
            ServiceHTTP: Marcelle ServiceHTTP object.
        """
        return ServiceHTTP(self.location + name, self.access_token)


class ServiceHTTP:
    def __init__(self, location, access_token):
        """Services provide an interface to interact with data stored in Marcelle backend.
        Since Marcelle backends are based on Feathers.js (https://docs.feathersjs.com/),
        services provide a similar API with predefined CRUD methods.

        Args:
            location (str): Service location URL.
        """
        super().__init__()
        self.location = location
        self.access_token = access_token

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
        try:
            url = self.location
            if "query" in params and params["query"] is not None:
                q = process_query(params["query"])
                url += q
            res = requests.get(
                url, headers={"Authorization": "Bearer " + self.access_token}
            )
            if res.status_code != 200:
                print(
                    "Error: Could not find items from service."
                    f"HTTP Status Code: {res.status_code}"
                )
            else:
                return res.json()
        except requests.exceptions.RequestException:
            print("Warning: could not reach Marcelle backend at " + str(self.location))

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
        try:
            url = self.location + "/" + id
            if "query" in params and params["query"] is not None:
                q = process_query(params["query"])
                url += q
            res = requests.get(url)
            if res.status_code != 200:
                print(
                    "Error: Could not find items from service. Improve error message."
                    f"HTTP Status Code: {res.status_code}"
                )
            else:
                return res.json()
        except requests.exceptions.RequestException:
            print("Warning: could not reach Marcelle backend at " + str(self.location))

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
        try:
            url = self.location
            if "query" in params and params["query"] is not None:
                q = process_query(params["query"])
                url += q
            res = requests.post(url, json=conform_dict(data))
            if res.status_code != 201:
                print(
                    "Error: Could not create item. Improve error message."
                    f"HTTP Status Code: {res.status_code}"
                )
            else:
                return res.json()
        except requests.exceptions.RequestException:
            print("Warning: could not reach Marcelle backend at " + str(self.location))

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
        try:
            url = self.location + "/" + id
            if "query" in params and params["query"] is not None:
                q = process_query(params["query"])
                url += q
            res = requests.put(url, json=conform_dict(data))
            if res.status_code != 200:
                print("An error occured with HTTP Status Code:", res.status_code)
            else:
                return res.json()
        except requests.exceptions.RequestException:
            print("Warning: could not reach Marcelle backend at " + str(self.location))

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
        try:
            url = self.location + "/" + id
            if "query" in params and params["query"] is not None:
                q = process_query(params["query"])
                url += q
            res = requests.patch(url, json=conform_dict(data))
            if res.status_code != 200:
                print("An error occured with HTTP Status Code:", res.status_code)
            else:
                return res.json()
        except requests.exceptions.RequestException:
            print("Warning: could not reach Marcelle backend at " + str(self.location))

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
        try:
            url = self.location + "/" + id
            if "query" in params and params["query"] is not None:
                q = process_query(params["query"])
                url += q
            res = requests.delete(url)
            if res.status_code != 200:
                print("An error occured with HTTP Status Code:", res.status_code)
            else:
                return res.json()
        except requests.exceptions.RequestException:
            print("Warning: could not reach Marcelle backend at " + str(self.location))

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
                raise type(e)(
                    "Error thrown while iterating through a service: " + e.message
                )


def process_query(query):
    q = "?"
    for key, val in query.items():
        if key == "$sort":
            for k, v in val.items():
                q += "%s[%s]=%s&" % (key, k, v)
        elif key == "$select":
            for v in val:
                q += "%s[]=%s&" % (key, v)
        elif type(val) == dict and "$in" in val:
            for v in val["$in"]:
                q += "%s[$in][]=%s&" % (key, v)
        elif type(val) == dict and "$nin" in val:
            for v in val["$nin"]:
                q += "%s[$nin][]=%s&" % (key, v)
        elif type(val) == dict and "$lt" in val:
            q += "%s[$lt]=%s&" % (key, val["$lt"])
        elif type(val) == dict and "$lte" in val:
            q += "%s[$lte]=%s&" % (key, val["$lte"])
        elif type(val) == dict and "$gt" in val:
            q += "%s[$gt]=%s&" % (key, val["$gt"])
        elif type(val) == dict and "$gte" in val:
            q += "%s[$gte]=%s&" % (key, val["$gte"])
        elif type(val) == dict and "$ne" in val:
            q += "%s[$ne]=%s&" % (key, val["$ne"])
        elif key == "$or":
            print("Warning: query operator $or is not implemented")
        else:
            q += "%s=%s&" % (key, val)
    return q[:-1]
