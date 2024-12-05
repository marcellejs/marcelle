import numpy as np


def normalize_value(v):
    if isinstance(
        v,
        (
            np.int_,
            np.intc,
            np.intp,
            np.int8,
            np.int16,
            np.int32,
            np.int64,
            np.uint8,
            np.uint16,
            np.uint32,
            np.uint64,
        ),
    ):
        return int(v)

    elif isinstance(v, (np.float_, np.float16, np.float32, np.float64)):
        return float(v)

    elif isinstance(v, (np.complex_, np.complex64, np.complex128)):
        return {"real": v.real, "imag": v.imag}

    elif isinstance(v, (np.ndarray,)):
        return v.tolist()

    elif isinstance(v, (np.bool_)):
        return bool(v)

    elif isinstance(v, (np.void)):
        return None

    return v


def conform_dict(d):
    """Normalize a dictionary for JSON serialization, casting numpy types

    Args:
        d (dict): Input dictionary

    Returns:
        dict: Normalized dictionary
    """
    if type(d) != dict:
        return normalize_value(d)
    for k, v in d.items():
        if type(v) == dict:
            d[k] = conform_dict(v)
        elif type(v) == list:
            d[k] = [conform_dict(x) for x in v]
        else:
            d[k] = normalize_value(v)
    return d
