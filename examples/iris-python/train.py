from skl2onnx.common.data_types import FloatTensorType
from skl2onnx import convert_sklearn
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import classification_report

iris = load_iris()
print("---------------------------")
print("classes", ", ".join(iris.target_names))
print("---------------------------")

X, y = iris.data, iris.target
X_train, X_test, y_train, y_test = train_test_split(X, y)

clr_rf = RandomForestClassifier()
clr_rf.fit(X_train, y_train)
print(
    f"Classification report for classifier {clr_rf}:\n"
    f"{classification_report(y_test, clr_rf.predict(X_test))}\n"
)

initial_type = [("x", FloatTensorType([1, 4]))]
onx_rf = convert_sklearn(
    clr_rf,
    initial_types=initial_type,
    target_opset=12,
    options={"zipmap": False},
)

with open("../public/iris_rf.onnx", "wb") as f:
    f.write(onx_rf.SerializeToString())

clr_svm = SVC()
clr_svm.fit(X_train, y_train)
print(
    f"Classification report for classifier {clr_svm}:\n"
    f"{classification_report(y_test, clr_svm.predict(X_test))}\n"
)

initial_type = [("x", FloatTensorType([1, 4]))]
onx_svm = convert_sklearn(
    clr_svm,
    initial_types=initial_type,
    target_opset=12,
    options={"zipmap": False},
)

with open("../public/iris_svc.onnx", "wb") as f:
    f.write(onx_svm.SerializeToString())
